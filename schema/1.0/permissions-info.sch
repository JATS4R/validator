
<pattern id="permissions-info" xmlns="http://purl.oclc.org/dsdl/schematron">

  <rule context="(permissions/copyright-statement)[1]">
    <report test="self::node()"> 
      ✓INFO: The content of the &lt;copyright-statement> is intended for
      display; i.e. human consumption. Therefore, the contents of this element aren't addressed by
      these recommendations. 
    </report>
  </rule>
  
  
  <rule context="license">
    <report test="license-p[1]">
      ✓INFO: The &lt;license-p> element is intended to be human-readable
      documentation, and any content is allowed, including, for example, &lt;ext-link> elements with
      URIs. Such URIs within the &lt;license-p> element will be ignored. (It is the responsibility
      of the content producer to ensure that the human-readable version of the license statement
      matches the (machine-readable) license URI.) 
    </report>
    <report test="p[1]"> 
      ✓INFO: The &lt;p> element in &lt;license> is intended to be human-readable
      documentation, and any content is allowed, including, for example, &lt;ext-link> elements with
      URIs. Such URIs within the &lt;license-p> element will be ignored. (It is the responsibility
      of the content producer to ensure that the human-readable version of the license statement
      matches the (machine-readable) license URI.) 
    </report>
  </rule>

  <rule context="license/p | license/license-p">
    <report test="ext-link"> 
      INFO: Any link in the text of a license should be to a human-readable
      license that does not contradict the machine-readable lincense referenced at
      license/@xlink:href. 
    </report>
  </rule>

  <rule context="license">
    <report test="@license-type"> 
      ✓INFO: While the @license-type attribute might be useful in some closed production systems, 
      be aware that its allowable values have not been standardized, and are therefore not usable 
      by automated systems.
    </report>
  </rule>

  <rule context="permissions">
    <report test='not(ancestor::article-meta)'>
      ✓INFO: This article has a &lt;permissions> element that is not within &lt;article-meta>.
      This is used to override the article-level permissions, to specify that this object has
      different copyright or license conditions than the article as a whole.
    </report>
  </rule>



</pattern>
