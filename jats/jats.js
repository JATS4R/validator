// Some classes for holding information about the JATS schemas, as read from the 
// jats.yaml file.

if (typeof JATS == "undefined") JATS = {};


JATS.schema = (function() {

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

    db.forEach(function(repo) {
      repo.schemas.forEach(function(d) {
        var s = new Schema(repo, d);
        by_fpi[s.fpi] = s;
        by_sysid[s.sysid()] = s;
        var uri;
        if (uri = s.rng_uri()) by_rng_uri[uri] = s;
        if (uri = s.xsd_uri()) by_xsd_uri[uri] = s;
      })
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

  function Schema(repo, d) {
    var self = this;
    $.extend(true, self, d);
    self.repo = repo;
    self.sysid = function() {
      return self.repo.uri_prefix + self.sysid_rel;
    };
    self.rng_uri = function() {
      return self.rng_uri_rel ? self.repo.uri_prefix + self.rng_uri_rel : null;
    };
    self.xsd_uri = function() {
      return self.xsd_uri_rel ? self.repo.uri_prefix + self.xsd_uri_rel : null;
    }
  }

  return {
    read_database: read_database,
    JatsSchemaDb: JatsSchemaDb
  }

})();
