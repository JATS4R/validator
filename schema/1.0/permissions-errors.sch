<!-- 
  Tests for permissions, JATS4R GitHub issues #2, #11, #13 
-->
<pattern id="permissions-errors" xmlns="http://purl.oclc.org/dsdl/schematron">
  
  <rule context="article-meta">
    <assert test="permissions">
      ✓ERROR: Missing top-level &lt;permissions> element. JATS4R-compliant articles must include
      a &lt;permissions> element within &lt;article-meta>.
    </assert>
  </rule>

  <!-- <copyright-statement> must be followed by a <copyright-year> -->
  <rule context="copyright-holder">
    <assert test="preceding-sibling::copyright-year"> 
      ERROR: The &lt;copyright-year> and
      &lt;copyright-holder> elements are intended for machine-readability. Therefore, when there is
      a copyright (i.e. the article is not in the public domain) we recommend that both of these
      elements be used. 
    </assert>
  </rule>

  <rule context="copyright-year">
    <assert test="following-sibling::copyright-holder"> 
      ERROR: The &lt;copyright-year> and
      &lt;copyright-holder> elements are intended for machine-readability. Therefore, when there is
      a copyright (i.e. the article is not in the public domain) we recommend that both of these
      elements be used. 
    </assert>

    <!-- <copyright-year> should be a 4-digit number -->
    <assert test="number() and number() > 999 and number() &lt; 10000"> 
      ERROR:
      &lt;copyright-year&gt; must be a 4-digit year, not "<value-of select="."/>". 
    </assert>
    <report test="normalize-space(string(.)) != string(.)"> 
      ERROR: &lt;copyright-year&gt; should not
      contain whitespace. 
    </report>
  </rule>

</pattern>
