// SAXON API: http://www.saxonica.com/ce/user-doc/1.1/html/api/
// onSaxonLoad is called when Saxon has finished loading
var onSaxonLoad = function() {

  // Various DOM elements
  var statusNode = document.getElementById('status');
  var input = document.getElementById('input');
  var phaseNode = document.getElementById('phase');
  var revalidate = document.getElementById('revalidate');
  var results = document.getElementById('results');

  // Which XSLT to use depending on the level selected
  var xslt = {
    errors:   'jats4r-level-errors.xsl',
    warnings: 'jats4r-level-warnings.xsl',
    info:     'jats4r-level-info.xsl'
  };


  // Some classes for holding information about a dtd, as read from the dtds.yaml file
  function Dtd(dtd_data) {
    var self = this;
    self.data = dtd_data;

    var path = dtd_data.path;
    this.path = path;
    this.dir = path.replace(/(.*)\/.*/, "$1");
    this.filename = path.replace(/.*\//, "");;
  }

  function DtdDatabase(db) {
    var self = this;
    self.db = db;

    var dtd_by_fpi = {};
    db.dtds.forEach(function(dtd_data) {
      dtd_by_fpi[dtd_data.fpi] = new Dtd(dtd_data);
    });
    self.dtd_by_fpi = dtd_by_fpi;
  }

  // Display an error message; with a header and a main message.
  // `pre` is optional; if true, then the message is wrapped in a <pre> element
  // for readability (used to display the output of xmllint, for example).
  function displayError(head, msg, pre) {
    var msg_div;
    if (msg instanceof Element) {
      msg_div = msg;
    }
    else {
      if (typeof(pre) !== "undefined" && pre) {
        msg_div = document.createElement("pre");
      }
      else {
        msg_div = document.createElement("div");
      }
      msg_div.textContent = msg;
    }

    results.insertBefore(msg_div, null);
    var h = document.createElement("h2");
    h.textContent = head;
    results.insertBefore(h, msg_div);

    statusNode.textContent = 'Finished';
  }



  // This function gets called when we've finished reading the DTD, or, if
  // there is no DTD, immediately when the validation begins. If there is
  // no DTD, this will be called with only one argument.
  function do_validate(contents, dtd_filename, dtd_contents) {
    statusNode.textContent = 'Validating…';

    var filename = input.files[0].name;
    var result;
    if (typeof(dtd_filename) !== "undefined") {

      // If there is a DTD, invoke xmllint with:
      // --loaddtd - this causes the DTD specified in the doctype declaration
      //     to be loaded when parsing. This is necessary to resolve entity references.
      //     But note that this is redundant, because --valid causes the DTD to be loaded,
      //     too.
      // --valid - cause xmllint to validate against the DTD that it finds from the doctype
      //     declaration.
      // --noent - tells xmlint to resolve all entity references
      var args = ['--loaddtd', '--valid', '--noent', filename];

      var files = [
          {
              path: filename,
              data: contents
          },
          {
              path: dtd_filename,
              data: dtd_contents
          }
      ];

      result = xmllint(args, files);

      //console.log(result);
      if (result.stderr.length) {
        displayError("Failed DTD validation", result.stderr, true);
        return;
      }
    }
    else {
      // If no DTD:
      console.log('filename = ' + filename + "\ncontents = '" + contents + "'");

      var args = [filename];

      var files = [
          {
              path: filename,
              data: contents
          }
      ];

      result = xmllint(args, files);
    }

    statusNode.textContent = 'Validated';

    var doc, pe;
    var parse_error = false;
    try {
      doc = Saxon.parseXML(result.stdout);
    }
    catch (e) {
      parse_error = true;
    }
    if (!doc) { parse_error = true; }
    if (!parse_error) {
      pe = doc.querySelector("parsererror");
    }
    if (parse_error || pe) {
      if (!pe) { pe = "Unable to parse the input XML file."; }
      displayError("Error parsing input file", pe);
      return;
    }

    // run the Schematron tests
    // FIXME:  need to parameterize the version number
    var phase = phaseNode.value;
    Saxon.run({
      stylesheet: 'generated-xsl/0.1/' + xslt[phase],
      source: doc,
      method: 'transformToDocument',
      success: function(processor) {
        statusNode.textContent = 'Converting…';

        // Convert the output SVRL to HTML. When done, this calls updateHTMLDocument,
        // which uses the @href attribute in the <xsl:result-document> element in the
        // stylesheet to update the #result element in the HTML page.
        Saxon.run({
          stylesheet: 'svrl-to-html.xsl',
          source: processor.getResultDocument(),
          method: 'updateHTMLDocument'
        });
        statusNode.textContent = 'Finished';
      }
    });
  }


  // This gets called in response to the user choosing a file, or pressing the
  // "Revalidate" button.

  function validate_file(dtds) {
    // clear any previous results
    results.textContent = '';
    if (!input.files.length) {
      statusNode.textContent = "Please select a file first!";
      return;
    }
    statusNode.textContent = 'Processing…';

    var reader = new FileReader();
    reader.onload = function() {
      // Get the contents of the xml file
      var contents = this.result;

      // Look for a doctype declaration
      var doctype_pub_re = /<!DOCTYPE\s+\S+\s+PUBLIC\s+\"(.*?)\"\s+\"(.*?)\"\s*>/;
      if (m = contents.match(doctype_pub_re)) {
        var fpi = m[1];
        var sysid = m[2];

        var dtd = dtds.dtd_by_fpi[fpi] || null;
        if (!dtd) {
          displayError("Bad doctype declaration",
            "Unrecognized public identifier: '" + fpi + "'");
        }

      }
      else {
        var doctype_sys_re = /<!DOCTYPE\s+\S+\s+SYSTEM\s+\"(.*?)\"\s*>/;
        if (m = contents.match(doctype_sys_re)) {
          displayError("No public identifier in doctype declaration",
            "A doctype declaration was found that only contains a SYSTEM identifer; " +
            "and no PUBLIC identifer.");
        }
        else {
          displayError("No doctype declaration found",
            "No doctype declaration was found, so DTD validation was skipped");
        }
      }

      if (!dtd) {
        do_validate(contents);
        return;
      }

      // Fetch the flattened DTD
      fetch("dtds/" + dtd.path).then(function(response) {
        return response.text();
      })
        .then(
          function(dtd_contents) {
            // We use the public identifier from the doctype declaration to find the DTD,
            // but xmllint fetches it by system identifier. So, we store whatever the system
            // identifier is, for use by that call.
            do_validate(contents, sysid, dtd_contents);
          },
          function(err) {
            console.error(err);
          }
        );
    }

    // Read the file. This results in the onload function above being called
    reader.readAsText(input.files[0]);
  }


  // First fetch the DTDs database, then add event listeners to do the validation
  fetch("dtds.yaml")
    .then(function(response) {
      return response.text();
    })
    .then(function(yaml_str) {
      var dtds = new DtdDatabase(jsyaml.load(yaml_str));

      statusNode.textContent = 'Choose a JATS XML file to validate.';

      // listen for file selection, or for a press on the "revalidate" button
      function validate() {
        validate_file(dtds);
      }
      input.addEventListener('change', validate);
      revalidate.addEventListener('click', validate);
    });
}
