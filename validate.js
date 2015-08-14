$(document).ready(function() {
  $('#sample_select').chosen();
});

// SAXON API: http://www.saxonica.com/ce/user-doc/1.1/html/api/
// onSaxonLoad is called when Saxon has finished loading
var onSaxonLoad = function() {

  // Which XSLT to use depending on the level selected
  var xslt = {
    errors:   'jats4r-level-errors.xsl',
    warnings: 'jats4r-level-warnings.xsl',
    info:     'jats4r-level-info.xsl'
  };
  var NEUTRAL = 0,
      GOOD = 1,
      INFO = 2,
      WARN = 3,
      ERROR = 4,
      BUSY = 5;


  // Singleton DtdDatabase object (see below for the class definition)  
  var dtd_database = null;

  // This is the input JATS file we'll be working on
  var input_file;

  // Last JATS URL
  var input_url;

  // Console for output; see class definition below
  var results = new Results();

  clear_input_file();
  clear_input_url();

  // First fetch the DTDs database, then add event handlers
  fetch("dtds.yaml")
    .then(function(response) {
      return response.text();
    })
    .then(function(yaml_str) {
      dtd_database = new DtdDatabase(jsyaml.load(yaml_str));

      // Set event handlers

      $('#level_select').on('change', function(e) {

        // When the report level changes, if there's already a file
        // selected, then revalidate it.
        if (input_url) {
          console.log("validating url");
          start_session_url();
        }
        else if (input_file) {
          set_drop_area();
          start_session_file();
        }
      });

      $('#choose_input').on('change', function(e) {
        input_file = $('#choose_input').get()[0].files[0];
        if (input_file) {
          set_drop_area();
          start_session_file();        
        }
        else {
          clear_input_file();
          reset_session();
        }
      });

      $('#jats_url').on('change', function(e) {
        input_url = $('#jats_url').val();
        start_session_url();
      });

      $('#drop_div')
        .bind('dragenter', ignore_drag)
        .bind('dragover', ignore_drag)
        .bind('drop', function(e) {
          ignore_drag(e);
          input_file = e.originalEvent.dataTransfer.files[0];
          set_drop_area();
          start_session_file();
        });

      $('#revalidate').on('click', function(e) {
        if (input_url) {
          console.log("validating url");
          start_session_url();
        }
        else if (input_file) {
          set_drop_area();
          start_session_file();
        }
        else {
          set_status("Please select a file first!", ERROR);
        }
      });

      $('#sample_select').on('change', function(e) {
        $('#jats_url').val(e.target.value)
                      .trigger("change");
      });

      // Ready to go
      results.reset();
    });


  // Set the status. Values for level are one of NEUTRAL (default), GOOD, INFO, 
  // WARN, or ERROR. Most of the time, this is called from the results
  // object.
  function set_status(status, level) {
    if (typeof level == "undefined") level = NEUTRAL;
    var cls = ["neutral", "good", "info", "warn", "error", "busy"][level];
    $('#status').attr('class', "status-" + cls)
                .text(status);
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

  function clear_input_file() {
    input_file = null;
    $("#drop_div").html('or drop your JATS file here')
                  .removeClass("dropped");
    // To clear the file input control, we need to replace it with a clone,
    // while preserving the event handlers
    var choose_input = $('#choose_input');
    choose_input.replaceWith( choose_input.clone( true ) );
  }

  function clear_input_url() {
    input_url = null;
    $('#jats_url').val('');
  }
  

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
    self.path = path;
    self.dir = path.replace(/(.*)\/.*/, "$1");
    self.filename = path.replace(/.*\//, "");;
  }


  // Class to handle the results output and status message. In general, this
  // manages the state of the machine. Use as follows:
  //   // The first time this is called for a validation session, it
  //   // resets all the status/results displays
  //   results.start_phase("Now doing ...")
  //     .then(function() {
  //       ...
  //       results.info(m), results.warn(m), results.error(m) - generate messages
  //       ...
  //       results.start_phase("Doing something else ...")
  //         .then(function() {
  //           ...
  //           results.done();  // Finish up, reset back to the initial state
  //         })
  //     })

  function Results() {
    var self = this;
    var results_area = $('#results');
    var phase = null;   // phase == null means we're in initial state
    var session_level;  // level of the most severe message received so far,
                        //   one of GOOD, INFO, WARN, or ERROR
    var phase_level;    // level of the most severe message in this phase
    var report_level;   // value of the user-controlled select box

    self.busy = function() {
      return phase != null;
    }

    self.reset = function() {
      phase = null;
      results_area.html('');
      results_area.hide();
      set_status('Choose a JATS XML file to validate.');
    }

    // start_phase returns a Promise, because we're using setTimeout to
    // make sure that the status update is rendered and visible to the user, 
    // before embarking on very cpu-intensive processing. Otherwise, the
    // display freezes.

    var PHASE_DELAY = 100;   // in milliseconds
    self.start_phase = function(p, id) {
      return new Promise(function(resolve, reject) {
        //console.log("start_phase: " + p);
        results_area.show();

        // If phase is null, then we're starting a new session
        if (!phase) {
          var lsv = $('#level_select').val();
          report_level = 
              lsv == "errors" ? ERROR
            : lsv == "warnings" ? WARN
            : INFO;
          results_area.html('');
          level = GOOD;
          disable_controls();
        }
        phase_level = GOOD;
        phase = $('<div class="phase"><h2>' + p + '</h2></div>');
        if (typeof id !== "undefined" && id) {
          phase.attr('id', id);
        }
        results_area.append(phase);
        set_status(p, BUSY);
        // Go to sleep to give the display time to update
        setTimeout(function() {
          resolve();
        }, PHASE_DELAY);
      })
    }

    self.done = function() {
      phase = null;
      var message = 
          level == GOOD ? ". All good."
        : level == INFO ? " with informational messages."
        : level == WARN ? " with warnings."
        : " with errors.";
      set_status("Finished" + message, level);
      enable_controls();
    }

    // Takes the argument passed to one of info(), warn(), or error(), and makes
    // a jQuery element out of it, adding the appropriate class.
    function make_node(msg, cls) {
      var m = typeof msg == "string"
        ? $('<div>' + msg + '</div>')
        : msg;
      m.attr('class', cls);
      return m;
    }

    // Any of the following functions can take either a string or a jQuery <div/>
    self.info = function(msg) {
      if (report_level > INFO) return;
      phase.append(make_node(msg, 'info'));
      self.bump_level(INFO);
    }
    self.warn = function(msg) {
      if (report_level > WARN) return;
      phase.append(make_node(msg, 'warn'));
      self.bump_level(WARN);
    }
    self.error = function(msg) {
      phase.append(make_node(msg, 'error'));
      self.bump_level(ERROR);
    }

    self.bump_level = function(new_level) {
      phase_level = Math.max(phase_level, new_level);
      level = Math.max(level, new_level);
    }
  }

  // Reset any vestiges of a previous session
  function reset_session() {
    $('#listing-div').hide();
    window.location.hash = '';
    results.reset();
  }

  function disable_controls() {
    $('#revalidate, #level_select, #choose_input').prop('disabled', true);
    $('#sample_select').prop('disabled', true).trigger("chosen:updated");
  }

  function enable_controls() {
    $('#revalidate, #level_select, #choose_input').prop('disabled', false);
    $('#sample_select').prop('disabled', false).trigger("chosen:updated");
  }

  // Adapt the JavaScript File Reader interface to use Promises.
  function read_file(filename) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function() {
        resolve(this.result);
      }
      reader.onerror = function(e) {
        reject(e);
      }
      reader.readAsText(filename);
    });
  }


  // This gets called in response to the user choosing a file, dropping a file,
  // or pressing the "Revalidate" button, when the last thing validated was a file.

  function start_session_file() {
    clear_input_url();
    reset_session();
    //disable_controls();

    // Read the file. This results in the onload function above being called
    results.start_phase("Reading the XML file")
      .then(function() {
        return read_file(input_file);
      })
      .then(function(content) {
        validate_session(content);
      })
      .catch(function(err) {
        var msg = "Error attempting to read the file."
        var error_message = err.message;
        if (error_message) {
          msg += "\n\nSystem message: " + error_message;
        }
        results.error(msg);
        results.done();
        //enable_controls();
      });
  }

  function start_session_url() {
    clear_input_file();
    reset_session();
    //disable_controls();

    results.start_phase("Fetching the XML file")
      .then(function() {
        var headers = new Headers();
        headers.append("Accept", "application/jats+xml;q=1, application/xml");
        fetch(input_url, { headers: headers })
          .then(function(response) {
            if (response.status < 200 || response.status >= 300) {
              throw Error("Bad response when fetching the XML file: " +
                response.status + " - " + response.statusText);
            }
            return response.text();
          })
          .then(function(content) {
            validate_session(content);
          })
          .catch(function(err) {
            results.error("Error attempting to fetch the file: " + err.message);
            results.done();
          });
      });
  }

  // This gets called in response to the user choosing a file, dropping a file,
  // or pressing the "Revalidate" button.

  function validate_session(contents) {
    // Look for xml declaration. If one is found, change any encoding to utf-8
    var xml_decl_re =
      /^(<\?xml\s+.*?encoding\s*=\s*('|\"))(.*?)(('|\").*?\?>)/;
    contents = contents.replace(xml_decl_re, "$1utf-8$4");

    // Look for a doctype declaration
    var doctype_pub_re = 
      /<!DOCTYPE\s+\S+\s+PUBLIC\s+('|\")(.*?)('|\")\s+('|\")(.*?)('|\")\s*(\[[\s\S]*?\]\s*)?>/;
    if (m = contents.match(doctype_pub_re)) {
      var fpi = m[2];
      var sysid = m[5];

      var dtd = dtd_database.dtd_by_fpi[fpi] || null;
      if (!dtd) {
        results.error("Bad doctype declaration. " +
          "Unrecognized public identifier: '" + fpi + "'");
      }
    }
    else {
      var doctype_sys_re = 
        /<!DOCTYPE\s+\S+\s+SYSTEM\s+\"(.*?)\"\s*(\[[\s\S]*?\]\s*)?>/;
      if (m = contents.match(doctype_sys_re)) {
        results.error(
          "A doctype declaration was found that only contains a SYSTEM identifer. " +
          "Documents conforming to JATS4R that use DTDs are required to include " +
          "a PUBLIC identifier.");
      }
      else {
        results.info(
          "No doctype declaration was found, so DTD validation was skipped");
      }
    }

    if (!dtd) {
      do_validate(contents);
    }

    else {
      // Fetch the flattened DTD
      fetch("dtds/" + dtd.path)
        .then(function(response) {
          if (response.status < 200 || response.status >= 300)
            throw Error("Bad response when fetching the DTD: " +
              response.status + " - " + response.statusText);
          return response.text();
        })
        .then(function(dtd_contents) {
          // We use the public identifier from the doctype declaration to find the DTD,
          // but xmllint fetches it by system identifier. So, we store whatever the system
          // identifier is, for use by that call.
          do_validate(contents, sysid, dtd_contents);
        })
        .catch(function(err) {
          results.error(err.message);
          results.done();
          //enable_controls();
        });
    }
  }


  // This function gets called when we've finished reading the DTD, or, if
  // there is no DTD, immediately after the instance document is read. 
  // If there is no DTD, this will be called with only one argument.
  function do_validate(contents, dtd_filename, dtd_contents) 
  {
    parse_and_dtd_validate(contents, dtd_filename, dtd_contents)
      .then(function(results) {
        schematron_validate(results);
        //enable_controls();
      });
  }


  function parse_and_dtd_validate(contents, dtd_filename, dtd_contents) 
  {
    var to_validate = typeof(dtd_filename) !== "undefined";
    var msg = "Parsing " + (to_validate ? "and validating against the DTD" : "");
    return results.start_phase(msg)
      .then(function() {

        if (to_validate) {
          // If there is a DTD, invoke xmllint with:
          // --loaddtd - this causes the DTD specified in the doctype declaration
          //     to be loaded when parsing. This is necessary to resolve entity references.
          //     But note that this is redundant, because --valid causes the DTD to be loaded,
          //     too.
          // --valid - cause xmllint to validate against the DTD that it finds from the doctype
          //     declaration.
          // --noent - tells xmlint to resolve all entity references
          var args = ['--loaddtd', '--valid', '--noent', 'dummy.xml'];
          var files = [
            {
              path: 'dummy.xml',
              data: contents
            },
            {
              path: dtd_filename,
              data: dtd_contents
            }
          ];
        }
        else {
          // If no DTD:
          var args = ['dummy.xml'];
          var files = [
            {
              path: 'dummy.xml',
              data: contents
            }
          ];
        }

        try {
          var result = xmltool(args, files);
        }
        catch(e) {
          results.error(
            $('<div>Failed XML parsing and/or DTD validation. Error message from ' +
              'the parser was: ' +
              '<pre>' + e + '</pre></div>'));
          results.done();
          result = null;
        }

        if (result.stderr.length) {
          results.error($('<div>Failed ' + msg +
            '<pre>' + result.stderr + '</pre></div>'));
          results.done();
          result = null;
        }

        return result;
      });
  }

  // Finally, do the Schematron validation with Saxon CE
  function schematron_validate(result) 
  {
    results.start_phase("Checking JATS for Reuse rules", "schematron-results")
      .then(function() {


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
          results.error("Error parsing input file: " + pe);
          results.done();
        }

        else {
          // FIXME:  need to parameterize the version number
          var level = $('#level_select').val();
          Saxon.run({
            stylesheet: 'generated-xsl/0.1/' + xslt[level],
            source: doc,
            method: 'transformToDocument',
            success: function(processor) {
              // Convert the output SVRL to HTML. When done, this calls updateHTMLDocument,
              // which uses the @href attribute in the <xsl:result-document> element in the
              // stylesheet to update the #result element in the HTML page.
              // I guess this blocks until done.
              Saxon.run({
                stylesheet: 'svrl-to-html.xsl',
                source: processor.getResultDocument(),
                method: 'updateHTMLDocument'
              });

              do_xpath_locations(result.stdout);

              var sr = $('#schematron-results');
              var level = 
                  sr.find("td.error").length != 0 ? ERROR
                : sr.find("td.warn").length != 0 ? WARN
                : sr.find("td.info").length != 0 ? INFO
                : GOOD;
              results.bump_level(level);
              results.done();
            }
          });
        }
      });
  }

  function do_xpath_locations(doc) {
    // Get the xpath locations from the schematron output results
    var locs = $.map(
      $('.xpath-location'), 
      function(loc) {
        return $(loc).text();
      }
    );

    var args = ['--xpath-locator', 'file.xml'].concat(locs);
    var files = [{
      path: 'file.xml',
      data: doc
    }];
    result = xmltool(args, files);
    //console.log("stdout: '" + result.stdout + "'");
    //console.log("stderr: '" + result.stderr + "'");

    // Get the locations
    var loc_lines = result.stdout.split("\n");
    loc_lines.pop();
    var locations = loc_lines.map(function(line) {
        return line.split(":");
    });


    $('#listing-div').html(
      $('<pre>', {
        'id': 'listing',
        // FIXME: for now, no line numbers on the listing, because if conflicts
        // with the line-highlight plugin. The problem is that when you attempt
        // to highlight a line that's below the scroll of the div, it just
        // acts as if the div scrolling doesn't exist, and produces a rectangular
        // "highlight" background that's far down below the bottom of the div's
        // viewport.
        //'class': 'line-numbers',
        'data-line': locations.map(function(l){return l[0];}).join(","),
        'html': $('<code>', {
          'class': 'language-markup',
          'text': doc
        })
      })
    );
    Prism.highlightAll();
    $('#listing-div').show();

    $('.xpath-display').each(function(i, locspan) {
      $(locspan).wrap("<a href='#listing." + locations[i][0] + "'>")
    });

    // This set the height of the listing to be about the same as the viewport,
    // but I took it out.
    //$('.language-markup').attr('style', 
    //  'max-height: ' + Math.floor($(window).height() * 0.9) + 'px;');
  }

}
