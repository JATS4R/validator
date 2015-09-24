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

    var schema_by_fpi = {};
    var schema_by_sysid = {};
    var schema_by_rng = {};
    var schema_by_xsd = {};

    db.dtds.forEach(function(d) {
      var dtd = new Schema(d)
      schema_by_fpi[d.fpi] = dtd;
      schema_by_sysid[d.system_id] = dtd;
      if (d.rng) schema_by_rng[d.rng] = dtd;
      if (d.xsd) schema_by_xsd[d.xsd] = dtd;
    });

    self.schema_by_fpi = schema_by_fpi;
    self.schema_by_sysid = schema_by_sysid;
    self.schema_by_rng = schema_by_rng;
    self.schema_by_xsd = schema_by_xsd;
  }

  function Schema(schema_data) {
    var self = this;
    self.data = schema_data;

    var path = schema_data.path;
    self.path = path;
    self.dir = path.replace(/(.*)\/.*/, "$1");
    self.filename = path.replace(/.*\//, "");;
  }

  return {
    read_database: read_database,
    JatsSchemaDb: JatsSchemaDb
  }

})();
