jats4r_utils = (function() {

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
  };
})();
