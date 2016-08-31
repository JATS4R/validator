// This module contains functions for parsing the XML header, not including
// the xml declaration.
// parse_header() looks at everything up to and including the opening tag,
// and, among other things, makes a list of schema references.
// This returns an array of schema references, each of which is an object with:
// - type - one of 'xml-model-pi', 'doctype-decl', or 'xsd-attrs'
// - is_jats - boolean value: true == jats; false = jats4r
// - ref_type - one of 'dtd', 'rng', 'xsd', or 'schematron'
// - schema - If JATS, the Schema object from the yaml file database.
// - version - If JATS4R, the version number as a string.

if (typeof jats4r == "undefined") jats4r = {};

jats4r.parser = (function() {

  function parse_header(contents) {
    var results = jats4r.results;
    var schema_db = jats4r.jats_schema_db;
    var m, i;

    // We'll return this:
    var schema_refs = [];


    // Delete all comments
    // (Note that in these regexps we use
    // "[\s\S]" instead of ".", to make sure it matches newlines.)
    contents = contents.replace(/<\!--([\s\S]*?)-->/g, "");

    // Now grab everything up to and including the opening element.
    m = contents.match(/^[\s\S]*?<\s*article\s+([\s\S]*?)>/);
    if (!m) return schema_refs;
    contents = m[0];



    // Look for a doctype declaration
    // ------------------------------

    // This is first, because it should take precedence

    var doctype_pub_re =
      /<!DOCTYPE\s+\S+\s+PUBLIC\s+('|\")(.*?)('|\")\s+('|\")(.*?)('|\")\s*(\[[\s\S]*?\]\s*)?>/;
    if (m = contents.match(doctype_pub_re)) {

      var fpi = m[2];
      var sysid = m[5];

      s = schema_db.get_by_fpi(fpi) || null;
      var use_dtd = true;
      if (!s) {
        results.error("Bad doctype declaration. " +
          "Unrecognized public identifier: '" + fpi + "'");
        use_dtd = false;
      }
      else if (s.sysid() != sysid) {
        if (s.sysid().endsWith(sysid)) {
          results.error(
            "<p>Bad doctype declaration: it looks like this article only uses a " +
            "partial system identifier: '" + sysid + "'. In order to facilitate reuse, " +
            "we recommend " +
            "that all documents that use a doctype declaration include full " +
            "public and system identifiers.</p>\n"
          );
        }
        else {
          results.error(
            "<p>Bad doctype declaration: the public and system identifiers don't match.\n" +
            "Based on the public identifier of '" + fpi + "', we were expecting a " +
            "system identifier of '" + s.sysid() + "'. However, this document " +
            "has '" + sysid + "'. JATS4R requires that, when using a doctype declaration, " +
            "you should use the full URI of the system identifier.</p>\n"
          );
        }
      }
      if (use_dtd) {
        schema_refs.push({
          type: 'doctype-decl',
          is_jats: true,
          ref_type: 'dtd',
          schema: s,
        });
      }
    }
    else {
      var doctype_sys_re =
        /<!DOCTYPE\s+\S+\s+SYSTEM\s+('|\")(.*?)('|\")\s*(\[[\s\S]*?\]\s*)?>/;
      if (m = contents.match(doctype_sys_re)) {
        results.error(
          "A doctype declaration was found that only contains a SYSTEM identifer. " +
          "Documents conforming to JATS4R that use DTDs are required to include " +
          "a PUBLIC identifier.");
        var sysid = m[2];
        s = schema_db.get_by_sysid(sysid);
        if (!s) {
          results.error("Unrecognized system identifier '" + sysid + "'.");
        }
        else {
          schema_refs.push({
            type: 'doctype-decl',
            is_jats: true,
            ref_type: 'dtd',
            schema: s,
          });
        }
      }
    }



    // Look for <?xml-model?> PIs
    // --------------------------
    var xml_model_pis = [];
    if (m = contents.match(/<\?xml-model\s+([\s\S]*?)\s*\?>/g)) {
      for (i = 0; i < m.length; ++i) {
        xml_model_pis.push(jats4r.parser.parse_pi(m[i]));
      }
    }
    console.log("xml-model pis: %o", xml_model_pis);

    var s;
    xml_model_pis.forEach(function(pi) {
      if (!pi.href) return;

      var schema_ref = {
        type: 'xml-model-pi',
      };

      var schematypens = pi.schematypens ? pi.schematypens : '';
      var type = pi.type ? pi.type : '';

    /*
      // Check JATS4R <?xml-model?> PI
      if ( schematypens == "http://purl.oclc.org/dsdl/schematron" &&
           (m = pi.href.match(/http:\/\/jats4r\.org\//)) )
      {
        // We know they're *trying* to use this PI, make sure it's strictly correct:
        if (! (m = pi.href.match(/^http:\/\/jats4r\.org\/schema\/(\d+\.\d+)\/jats4r\.sch$/)) ) {
          results.error(
            "The JATS4R xml-model processing instruction seems to be in the wrong form. " +
            "Please check that the href pseudo-attribute is strictly of the form, for example, " +
            "<blockquote><pre>http://jats4r.org/schema/1.0/jats4r.sch</pre></blockquote>"
          );
        }
        else {
          schema_ref.is_jats = false;
          schema_ref.ref_type = 'schematron';
          schema_ref.version = m[1];
          schema_refs.push(schema_ref);
        }
      }
    */

      // Check for xml-model calling out one of DTD, RNG, or XSD
      if (type == "application/xml-dtd") {
        s = schema_db.get_by_sysid(pi.href) || null;
        if (!s) {
          results.error("Bad xml-model processing instruction. " +
            "This references a DTD, but the DTD is not one of the recognized JATS " +
            "DTD URLs: '" + pi.href + "'");
        }
        else {
          schema_ref.is_jats = true;
          schema_ref.ref_type = 'dtd';
          schema_ref.schema = s;
          schema_refs.push(schema_ref);
        }
      }
      else if (schematypens == "http://relaxng.org/ns/structure/1.0") {
        s = schema_db.get_by_rng_uri(pi.href) || null;
        if (s) {
          schema_ref.is_jats = true;
          schema_ref.ref_type = 'rng';
          schema_ref.schema = s;
          schema_refs.push(schema_ref);
        }
      }
      else if (schematypens == "http://www.w3.org/2001/XMLSchema") {
        s = schema_db.get_by_xsd_uri(pi.href) || null;
        if (s) {
          schema_ref.is_jats = true;
          schema_ref.ref_type = 'xsd';
          schema_ref.schema = s;
          schema_refs.push(schema_ref);
        }
      }
    });


    // Look for XSD attributes on the root element
    // -------------------------------------------

    var xsd_uri = null;
    var root_elem_re = /<\s*article\s+([\s\S]*?)>/;
    if (m = contents.match(root_elem_re)) {
      var root_attrs = parse_attrs(m[1]);

      // iterate through the attributes to see if an XSD namespace prefix was set
      var xsi_prefix = null;
      for (a in root_attrs) {
        if (a.startsWith("xmlns:") && root_attrs[a] ==
            "http://www.w3.org/2001/XMLSchema-instance")
        {
          xsi_prefix = a.substr(6);
          break;
        }
      }
      // now iterate again to see if a schema instance was specified
      for (a in root_attrs) {
        if (a = xsi_prefix + ":noNamespaceSchemaLocation") {
          xsd_uri = root_attrs[a];
          break;
        }
      }
    }
    if (xsd_uri) {
      s = schema_db.get_by_xsd_uri(xsd_uri) || null;
      if (s) {
        schema_refs.push({
          type: 'xsd-attrs',
          is_jats: true,
          ref_type: 'xsd',
          schema: s,
        });
      }
    }

    return schema_refs;
  }


  // Parse a PI
  function parse_pi(str) {
    var v;
    if (v = str.match(/^<\?\s*\S+\s+([\s\S]*?)\?>/)) {
      return parse_attrs(v[1]);
    }
    else {
      return {};
    }
  }


  // Parse out the attributes or pseudo-attributes
  function parse_attrs(str) {
    var attrs = {};
    var pos = 0;
    var state = 0;
    var strlen = str.length;
    var name = "";
    var val = "";
    var quote_char;

    // Each time through the loop, pos should point to the first non-whitespace.
    while (pos < strlen) {
      c = str.charAt(pos);
      var is_white = /\s/.test(c);

      // inside the name, looking for whitespace or "="
      if (state == 0) {
        if (is_white) {
          state = 1;
        }
        else if (c == "=") {
          state = 2;
        }
        else {
          name += c;
        }
      }

      // in whitespace after the name, looking for "="
      else if (state == 1) {
        if (c == "=") {
          state = 2;
        }
        else if (!is_white) {
          return attrs;
        }
      }

      // after "=", looking for whitespace or a quote
      else if (state == 2) {
        if (c == "'" || c == '"') {
          quote_char = c;
          state = 3;
        }
        else if (!/\s/.test(c)) {
          return attrs;
        }
      }

      // inside the value, looking for quote_char
      else if (state == 3) {
        if (c == quote_char) {
          attrs[name] = val;
          state = 4;
        }
        else {
          val += c;
        }
      }

      // After the whole pseudo-attr; skip whitespace
      else if (state == 4) {
        if (!is_white) {
          name = c;
          val = "";
          state = 0;
        }
      }

      pos++;
    }

    return attrs;
  }

  return {
    parse_pi: parse_pi,
    parse_attrs: parse_attrs,
    parse_header: parse_header,
  };
})();
