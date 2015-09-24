// Some classes for holding information about the JATS schemas, as read from the 
// jats-schema.yaml file.

if (typeof jats4r == "undefined") jats4r = {};


jats4r.jats_schema = (function() {

  // This returns a promise that resolves to the JatsSchemaDb object
  function read_database(yaml_file) {
    return fetch(yaml_file)
      .then(function(response) {
        return response.text();
      })
      .then(function(yaml_str) {
        return new jats4r.jats_schema.JatsSchemaDb(jsyaml.load(yaml_str));
      });
  }

  function JatsSchemaDb(db) {
    var self = this;
    self.db = db;      // original yaml file data

    var by_fpi = {};
    var by_sysid = {};
    var by_rng_uri = {};
    var by_xsd_uri = {};

    db.schema.forEach(function(d) {
      var s = new Schema(d)
      by_fpi[s.fpi] = s;
      by_sysid[s.dtd.sysid] = s;
      if (s.rng && s.rng.uri) by_rng_uri[s.rng.uri] = s;
      if (s.xsd && s.xsd.uri) by_xsd_uri[s.xsd.uri] = s;
    });

    self.get_by_fpi = function(fpi) {
      return by_fpi[fpi];
    }
    self.get_by_sysid = function(sysid) {
      return by_sysid[sysid];
    }
    self.get_by_rng_uri = function(rng_uri) {
      return by_rng_uri[rng_uri];
    }
    self.get_by_xsd_uri = function(xsd_uri) {
      return by_xsd_uri[xsd_uri];
    }
  }

  function Schema(d) {
    var self = this;
    $.extend(true, self, d);
    self.dtd_repo_path = function() {
      return self.repo_base_path + '/' + self.dtd.repo_path;
    }
  }

  return {
    read_database: read_database,
    JatsSchemaDb: JatsSchemaDb
  }

})();
