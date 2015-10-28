<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                xmlns:axsl="http://www.w3.org/1999/XSL/TransformAlias"
                exclude-result-prefixes="xsd"
                version="2.0">
  <xsl:import href='../lib/iso-schematron-xslt2/iso_svrl_for_xslt2.xsl'/>
  <xsl:param name="allow-foreign">true</xsl:param>
  
  <xsl:template name="process-prolog">
    <axsl:output method="xml" omit-xml-declaration="no" standalone="yes" indent="yes">
      <xsl:if test=" string-length($output-encoding) &gt; 0">
        <xsl:attribute name="encoding"><xsl:value-of select=" $output-encoding" /></xsl:attribute>
      </xsl:if>
    </axsl:output>

    <!-- FIXME: make this a generic version-comparator. Use feature testing if /article/@dtd-version
      isn't present. -->
    <axsl:function name='j4r:jats-version-later-1d3' as="xsd:boolean">
      <axsl:param name="v"/>
      <axsl:variable name='maj' select="substring-before($v, '.')"/>
      <axsl:variable name='min' select="substring-after($v, '.')"/>
      <axsl:variable name='min-is-num' select='number($min) = number($min)'/>
      <axsl:value-of select="
        $maj = '1' and
        ( $min-is-num and number($min) >= 1 or
        not($min-is-num) and $min > '1d3' )
      "/>
    </axsl:function>
    
  </xsl:template>
  
  
</xsl:stylesheet>