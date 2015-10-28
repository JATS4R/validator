
<pattern id="permissions-info" xmlns="http://purl.oclc.org/dsdl/schematron">

  <rule context="permissions/copyright-statement">
    <report test="true()"> 
      INFO: The content of the &lt;copyright-statement> is intended for
      display; i.e. human consumption. Therefore, the contents of this element aren't addressed by
      these recommendations. 
    </report>
  </rule>

  <rule context="license/license-p[1]">
    <report test="true()">
      INFO: The &lt;license-p> element is intended to be human-readable
      documentation, and any content is allowed, including, for example, &lt;ext-link> elements with
      URIs. Such URIs within the &lt;license-p> element will be ignored. (It is the responsibility
      of the content producer to ensure that the human-readable version of the license statement
      matches the (machine-readable) license URI.) 
    </report>
  </rule>

  <rule context="license/p[1]"> 
    <report test="true()">
      INFO: The &lt;p> element in &lt;license> is intended to be human-readable
      documentation, and any content is allowed, including, for example, &lt;ext-link> elements with
      URIs. Such URIs within the &lt;license-p> element will be ignored. (It is the responsibility
      of the content producer to ensure that the human-readable version of the license statement
      matches the (machine-readable) license URI.) 
    </report>
  </rule>

  <rule context="license/p/ext-link[1] | license/license-p/ext-link[1]">
    <report test="true()"> 
      INFO: Any link in the text of a license should be to a human-readable
      license that does not contradict the machine-readable license referenced at
      license/@xlink:href. 
    </report>
  </rule>

  <rule context="license/@license-type">
    <report test="true()"> 
      INFO: While the @license-type attribute might be useful in some closed production systems, 
      be aware that its allowable values have not been standardized, and are therefore not usable 
      by automated systems.
    </report>
  </rule>

  <rule context="permissions">
    <report test='not(ancestor::article-meta)'>
      INFO: This article has a &lt;permissions> element that is not within &lt;article-meta>.
      This is used to override the article-level permissions, to specify that this object has
      different copyright or license conditions than the article as a whole.
    </report>
  </rule>

  <rule context="ali:free_to_read">
    <report test="true()">
      INFO: This article contains the &lt;ali:free_to_read> element, indicating that it is not behind 
      access barriers, irrespective of any license specifications. The article should be accessible by 
      any user without payment or authentication.
    </report>
  </rule>

</pattern>
