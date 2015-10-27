
<pattern id="permissions-warnings" 
         xmlns="http://purl.oclc.org/dsdl/schematron"
         xmlns:fn="http://jats4r.org/ns">

  <rule context="license">

    <!-- For JATS 1.1d3 and later, <license> should have an <ali:license_ref> -->
    <report test="fn:jats-version-later-1d3(/article/@dtd-version) and 
                  not(ali:license_ref)">
      WARNING: No licence URI.
      For JATS 1.1d3 and later, if the licence is defined by a canonical URI, then the
      &lt;license> element should have an &lt;ali:license_ref> child, that specifies
      that URI.
    </report>
  
    <!-- For JATS 1.1d2 and earlier, <license> should have an @xlink:href to the license URI -->
  
    <report test="not(fn:jats-version-later-1d3(/article/@dtd-version)) and
                  not(normalize-space(@xlink:href))"> 
      WARNING: No licence URI.
      For JATS 1.1d2 and earlier, if the licence is defined by a canonical URI, then the
      &lt;license> element should have an @xlink:href attribute, that specifies
      that URI.
    </report>

  </rule>
</pattern>
