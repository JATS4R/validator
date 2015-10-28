<?xml version="1.0" encoding="UTF-8"?>
<!-- 
  This is an identity transform that will build a single schematron file from a 
  schematron built from multiple files
-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:iso="http://purl.oclc.org/dsdl/schematron"
                xmlns:j4r="http://jats4r.org/ns"
                version="2.0">

    <xsl:output omit-xml-declaration="no" indent="no"/>
    
    <xsl:template match="iso:* | xsl:* | j4r:* | @* | comment() | text()">
        <xsl:copy>
            <xsl:apply-templates select="*|@* | comment() | text()"/>
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="iso:include">
        <xsl:variable name="doc" select="document(@href)"/>
        <xsl:apply-templates select="$doc"/> 
    </xsl:template>

</xsl:stylesheet>