// SAXON API: http://www.saxonica.com/ce/user-doc/1.1/html/api/
// onSaxonLoad is called when Saxon has finished loading
var onSaxonLoad = function() {

  // Various DOM elements
  var results = document.getElementById('results');

  // Which XSLT to use depending on the level selected
  var xslt = {
    errors:   'jats4r-level-errors.xsl',
    warnings: 'jats4r-level-warnings.xsl',
    info:     'jats4r-level-info.xsl'
  };


  // Singleton DtdDatabase object (see below for the class definition)  
  var dtd_database = null;

  // This is the input JATS file we'll be working on
  var input_file = null;

  // First fetch the DTDs database, then add event handlers
  fetch("dtds.yaml")
    .then(function(response) {
      return response.text();
    })
    .then(function(yaml_str) {
      dtd_database = new DtdDatabase(jsyaml.load(yaml_str));
      set_status('Please choose a JATS XML file to validate.');
      

      // Set event handlers

      $('#level_select').on('change', function(e) {
        // When the report level changes, if there's already a file
        // selected, then revalidate it.
        if (input_file) {
          set_drop_area();
          validate_file();
        }
      });

      $('#choose_input').on('change', function(e) {
        input_file = $('#choose_input').get()[0].files[0];
        set_drop_area();
        validate_file();
      });

      $('#drop_div')
        .bind('dragenter', ignore_drag)
        .bind('dragover', ignore_drag)
        .bind('drop', function(e) {
          ignore_drag(e);
          input_file = e.originalEvent.dataTransfer.files[0];
          set_drop_area();
          validate_file();
        });

      $('#revalidate').on('click', function(e) {
        if (!input_file) {
          set_status("Please select a file first!");
        }
        else {
          set_drop_area();
          validate_file();
        }
      });
    });


  //----------------------------------------------------------------
  // Functions

  // Set the status
  function set_status(s) {
    $('#status').text(s);
  }

  /* 
    The following functions are by syssgx (https://github.com/syssgx),
    and are licensed CC-BY.
    See https://github.com/syssgx/xml.js/blame/gh-pages/js/script.js#L59.
  */

  // Called from the drag-and-drop handlers
  function ignore_drag(e) {
    e.originalEvent.stopPropagation();
    e.originalEvent.preventDefault();
  }

  // This sets the drop area to show info about the input JATS file
  function set_drop_area() {
    var filestring = 
      "<strong>" + escape(input_file.name) + "</strong> " + 
      "(" + (input_file.type || "n/a") + "): " + input_file.size + " bytes - " + 
      "<strong>last modified:</strong> " + 
      (input_file.lastModifiedDate ? 
        input_file.lastModifiedDate.toLocaleDateString() : "n/a");
    $("#drop_div").html(filestring)
                  .addClass("dropped");
  }

  /* End CC-BY licensed code. */


  // Some classes for holding information about a dtd, as read from the dtds.yaml file

  function DtdDatabase(db) {
    var self = this;
    self.db = db;

    var dtd_by_fpi = {};
    db.dtds.forEach(function(dtd_data) {
      dtd_by_fpi[dtd_data.fpi] = new Dtd(dtd_data);
    });
    self.dtd_by_fpi = dtd_by_fpi;
  }

  function Dtd(dtd_data) {
    var self = this;
    self.data = dtd_data;

    var path = dtd_data.path;
    this.path = path;
    this.dir = path.replace(/(.*)\/.*/, "$1");
    this.filename = path.replace(/.*\//, "");;
  }

  // Display an error message; with a header and a main message.
  // `pre` is optional; if true, then the message is wrapped in a <pre> element
  // for readability (used to display the output of xmllint, for example).
  function display_error(head, msg, pre) {
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

    set_status('Finished');
  }

  // This function gets called when we've finished reading the DTD, or, if
  // there is no DTD, immediately when the validation begins. If there is
  // no DTD, this will be called with only one argument.
  function do_validate(contents, dtd_filename, dtd_contents) {
    set_status('Validating…');

    console.log(">> input_file = " + input_file);
    var filename = input_file.name;
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
        display_error("Failed DTD validation", result.stderr, true);
        result = null;
      }
    }

    else {
      // If no DTD:
      var args = [filename];
      var files = [
        {
          path: filename,
          data: contents
        }
      ];
      result = xmllint(args, files);
    }

    if (result) {
      set_status('Validated');

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
        display_error("Error parsing input file", pe);
      }

      else {

        // run the Schematron tests
        // FIXME:  need to parameterize the version number
        var level = $('#level_select').val();
        Saxon.run({
          stylesheet: 'generated-xsl/0.1/' + xslt[level],
          source: doc,
          method: 'transformToDocument',
          success: function(processor) {
            set_status('Converting…');

            // Convert the output SVRL to HTML. When done, this calls updateHTMLDocument,
            // which uses the @href attribute in the <xsl:result-document> element in the
            // stylesheet to update the #result element in the HTML page.
            Saxon.run({
              stylesheet: 'svrl-to-html.xsl',
              source: processor.getResultDocument(),
              method: 'updateHTMLDocument'
            });
            set_status('Finished');
          }
        });
      }
    }
  
    $('#revalidate').prop('disabled', false);
  }


  // This gets called in response to the user choosing a file, dropping a file,
  // or pressing the "Revalidate" button.

  function validate_file() {
    // clear any previous results
    results.textContent = '';
    set_status('Processing…');

    var reader = new FileReader();
    reader.onload = function() {
      // Get the contents of the xml file
      var contents = this.result;

      // Look for a doctype declaration
      var doctype_pub_re = /<!DOCTYPE\s+\S+\s+PUBLIC\s+\"(.*?)\"\s+\"(.*?)\"\s*>/;
      if (m = contents.match(doctype_pub_re)) {
        var fpi = m[1];
        var sysid = m[2];

        var dtd = dtd_database.dtd_by_fpi[fpi] || null;
        if (!dtd) {
          display_error("Bad doctype declaration",
            "Unrecognized public identifier: '" + fpi + "'");
        }

      }
      else {
        var doctype_sys_re = /<!DOCTYPE\s+\S+\s+SYSTEM\s+\"(.*?)\"\s*>/;
        if (m = contents.match(doctype_sys_re)) {
          display_error("No public identifier in doctype declaration",
            "A doctype declaration was found that only contains a SYSTEM identifer; " +
            "and no PUBLIC identifer.");
        }
        else {
          display_error("No doctype declaration found",
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
    reader.readAsText(input_file);
  }
}
