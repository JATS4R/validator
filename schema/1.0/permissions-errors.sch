<?xml version="1.0" encoding="UTF-8"?>

<pattern id="permissions-errors" 
         xmlns="http://purl.oclc.org/dsdl/schematron"
         xmlns:j4r="http://jats4r.org/ns">
  
  <rule context="article-meta">
    <assert test="permissions">
      <j4r:meta rec='rec1' test-file='permissions-none.xml'/>
      ERROR: Missing top-level &lt;permissions> element. JATS4R-compliant articles must include
      a &lt;permissions> element within &lt;article-meta>.
    </assert>
  </rule>

  <rule context="permissions">
    <!-- <copyright-statement> or <copyright-holder> implies copyright; so there must also be a
      <copyright-year> -->
    <report test="(copyright-statement|copyright-holder) and not(copyright-year)"> 
      <j4r:meta rec='rec3' test-file='permissions-1.xml'/>
      ERROR: Missing &lt;copyright-year>.
      When an article is under copyright
      (i.e. it is not in the public domain) we recommend that &lt;copyright-year> be given.
    </report>

    <!-- Likewise, <copyright-statement> or <copyright-year> implies there must also be a
      <copyright-holder> -->
    <report test="(copyright-statement|copyright-year) and not(copyright-holder)"> 
      <j4r:meta rec='rec4' test-file='permissions-1.xml'/>
      ERROR: Missing &lt;copyright-holder>.
      When an article is under copyright
      (i.e. it is not in the public domain) we recommend that &lt;copyright-holder> be given.
    </report>
  </rule>

  <rule context="copyright-year">
    <assert test="number() and number() > 999 and number() &lt; 10000"> 
      <j4r:meta rec='rec3' test-file='permissions-1.xml'/>
      ERROR: &lt;copyright-year&gt; must be a 4-digit year, not "<value-of select="."/>". 
    </assert>
    <report test="normalize-space(string(.)) != string(.)"> 
      <j4r:meta rec='rec3' test-file='permissions-1.xml'/>
      ERROR: &lt;copyright-year&gt; should not contain whitespace. 
    </report>
  </rule>
  
  <rule context="license">
    <!-- If license/@xlink:href exists, it must not be empty -->
    <report test="@xlink:href and normalize-space(@xlink:href) = ''"> 
      <j4r:meta rec='rec5' test-file='permissions-2.xml'/>
      ERROR: Whenever the @xlink:href attribute appears on the &lt;license> element, its
      value must be the canonical URI of a valid license (such as a Creative Commons
      license). In this article, the attribute appears to be empty.
    </report>

    <!-- Same for ali:license_ref -->
    <report test="ali:license_ref and normalize-space(string(ali:license_ref)) = ''"> 
      <j4r:meta rec='rec6' test-file='permissions-2.xml'/>
      ERROR: Whenever the ali:license_ref element appears, its
      content must be the canonical URI of a valid license (such as a Creative Commons
      license). In this article, the attribute appears to be empty.
    </report>
    
    <!-- if both @xlink:href and ali:license_ref are used, they must match exactly -->
    <report test="@xlink:href and ali:license_ref and
                  string(@xlink:href) != string(ali:license_ref)">
      <j4r:meta rec='rec6' test-file='permissions-2.xml'/>
      ERROR: If both @xlink:href and &lt;ali:license_ref> are used to specify the licence
      URI of an article, their contents must match exactly.
    </report>
  </rule>
  
</pattern>
