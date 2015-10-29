<?xml version="1.0" encoding="UTF-8"?>

<pattern id="permissions-warnings" 
         xmlns="http://purl.oclc.org/dsdl/schematron"
         xmlns:j4r="http://jats4r.org/ns">

  <rule context="license">

    <!-- For JATS 1.1d3 and later, <license> should have an <ali:license_ref> -->
    <report test="j4r:jats-version-later-1d2(/article/@dtd-version) and 
                  not(@xlink:href) and not(ali:license_ref)">
      <j4r:meta rec='rec6' test-file='permissions-2.xml'/>
      WARNING: No licence URI.
      For JATS 1.1d3 and later, if the licence is defined by a canonical URI, then the
      &lt;license> element should have an &lt;ali:license_ref> child, that specifies
      that URI.
    </report>
    <report test="j4r:jats-version-later-1d2(/article/@dtd-version) and 
                  @xlink:href and not(ali:license_ref)">
      <j4r:meta rec='rec6' test-file='permissions-2.xml'/>
      WARNING: The license URI is given in @xlink:href.
      For JATS 1.1d3 and later, if the licence is defined by a canonical URI, then it
      should be specified in the &lt;ali:license_ref> child element.
    </report>
    
    <!-- For JATS 1.1d2 and earlier, <license> should have an @xlink:href to the license URI -->
    <report test="not(j4r:jats-version-later-1d2(/article/@dtd-version)) and
                  not(@xlink:href)"> 
      <j4r:meta rec='rec5' test-file='permissions-1.xml'/>
      WARNING: No licence URI.
      For JATS 1.1d2 and earlier, if the licence is defined by a canonical URI, then the
      &lt;license> element should have an @xlink:href attribute, that specifies
      that URI.
    </report>

  </rule>
</pattern>
