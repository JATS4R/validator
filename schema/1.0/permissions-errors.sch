<!-- 
  Tests for permissions, JATS4R GitHub issues #2, #11, #13 
-->
<pattern id="permissions-errors" xmlns="http://purl.oclc.org/dsdl/schematron"
  xmlns:j4r="http://jats4r.org/ns">
  
  <rule context="article-meta">
    <assert test="permissions" j4r:test-file='permissions-1.xml'>
      ✓ERROR: Missing top-level &lt;permissions> element. JATS4R-compliant articles must include
      a &lt;permissions> element within &lt;article-meta>.
    </assert>
  </rule>

  <rule context="permissions">
    <!-- <copyright-statement> or <copyright-holder> implies copyright; so there must also be a
      <copyright-year> -->
    <report test="(copyright-statement|copyright-holder) and not(copyright-year)"> 
      ✓ERROR: Missing &lt;copyright-year>.
      When an article is under copyright
      (i.e. it is not in the public domain) we recommend that &lt;copyright-year> be given.
    </report>

    <!-- Likewise, <copyright-statement> or <copyright-year> implies there must also be a
      <copyright-holder> -->
    <report test="(copyright-statement|copyright-year) and not(copyright-holder)"> 
      ✓ERROR: Missing &lt;copyright-holder>.
      When an article is under copyright
      (i.e. it is not in the public domain) we recommend that &lt;copyright-holder> be given.
    </report>
  </rule>

  <rule context="copyright-year">
    <assert test="number() and number() > 999 and number() &lt; 10000"> 
      ✓ERROR: &lt;copyright-year&gt; must be a 4-digit year, not "<value-of select="."/>". 
    </assert>
    <report test="normalize-space(string(.)) != string(.)"> 
      ✓ERROR: &lt;copyright-year&gt; should not contain whitespace. 
    </report>
  </rule>
  
  

</pattern>
