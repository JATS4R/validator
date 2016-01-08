<?xml version="1.0" encoding="UTF-8"?>

<pattern id="data-citations-errors" 
         xmlns="http://purl.oclc.org/dsdl/schematron"
         xmlns:j4r="http://jats4r.org/ns">

  <rule context="mixed-citation | element-citation">
    <report test="data-title and not(@publication-type='data')">
      <j4r:meta rec="rec1" test-file="data-citations.xml"/> 
      ERROR: When &lt;data-title> element is present, the @citation-type must be set to "data". 
    </report>
    <report test="@publication-type='data' and 
      ((not(source) and not(data-title)) or (article-title and not(data-title)))">
      <j4r:meta rec="rec3" test-file="data-citations.xml"/> 
      ERROR: &lt;data-title> and/or &lt;source> must be present in data citations. 
    </report>
  </rule>

  <rule context="year[ancestor::mixed-citation or ancestor::element-citation]">
    <assert test="matches(.,'^([1][4-9]|[2][0])[0-9][0-9]$')">
      <j4r:meta rec="rec4" test-file="data-citations.xml"/> 
      ERROR: &lt;year> in a citation must be a valid 4-digit year. "<value-of select="."/>" 
      was supplied 
    </assert>
  </rule>

  <rule context="version">
    <assert test="normalize-space(@designator)">
      <j4r:meta rec="rec8" test-file="data-citations.xml"/> 
      ERROR: &lt;version> must include a machine-readable version number in the @designator. 
    </assert>
  </rule>

</pattern>
