<?xml version="1.0" encoding="UTF-8"?>

<pattern id="datacitation-info" 
         xmlns="http://purl.oclc.org/dsdl/schematron"
         xmlns:j4r="http://jats4r.org/ns">

   <rule context="person-group">
    <report test="parent::node()[@publication-type='data'] and @person-group-type!='curator'"> 
	 <j4r:meta rec='rec2' test-file='data-citations.xml'/>
      INFO: Use @person-group-type="curator" on contributors to data citations where it is appropriate. 
    </report>
  </rule>





</pattern>
