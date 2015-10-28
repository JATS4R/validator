<?xml version="1.0" encoding="UTF-8"?>
<schema xmlns="http://purl.oclc.org/dsdl/schematron"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:j4r="http://jats4r.org/ns"
  queryBinding="xslt2">

  <ns prefix="j4r" uri="http://jats4r.org/ns"/>

  <pattern>
    <rule context="article-meta">
      <assert test="permissions">
        <j4r:meta test-file='permissions-none.xml'/>
        No &lt;permissions>!
      </assert>
    </rule>
  </pattern>
    
  <xsl:function name="j4r:fleegle" as="xs:boolean">
    <xsl:value-of select='true()'/>
  </xsl:function>
    
</schema>
