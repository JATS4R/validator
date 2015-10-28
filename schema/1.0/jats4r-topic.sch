<?xml version="1.0" encoding="UTF-8"?>

<schema xmlns="http://purl.oclc.org/dsdl/schematron" 
        xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
        xmlns:j4r="http://jats4r.org/ns"
        queryBinding="xslt2">

  <ns prefix="ali" uri="http://www.niso.org/schemas/ali/1.0"/>
  <ns prefix="j4r" uri="http://jats4r.org/ns"/>
  <ns prefix="mml" uri="http://www.w3.org/1998/Math/MathML"/>
  <ns prefix="xsi" uri="http://www.w3.org/2001/XMLSchema-instance"/>
  <ns prefix="xlink" uri="http://www.w3.org/1999/xlink"/>
  
  <phase id="permissions">
    <active pattern="permissions-errors"/>
    <active pattern="permissions-warnings"/>
    <active pattern="permissions-info"/>
  </phase>

  <phase id="math">
    <active pattern="math-errors"/>
    <active pattern="math-warnings"/>
    <active pattern="math-info"/>
  </phase>

  <include href="permissions-errors.sch"/>
  <include href="permissions-warnings.sch"/>
  <include href="permissions-info.sch"/>

  <include href="math-errors.sch"/>
  <include href="math-warnings.sch"/>
  <include href="math-info.sch"/>

  <xsl:function name='j4r:jats-version-later-1d2' as="xsd:boolean">
    <xsl:param name="v"/>
    <xsl:variable name='maj' select="substring-before($v, '.')"/>
    <xsl:variable name='min' select="substring-after($v, '.')"/>
    <xsl:variable name='min-is-num' select='number($min) = number($min)'/>
    <xsl:value-of select="
      $maj = '1' and
      ( $min-is-num and number($min) >= 1 or
      not($min-is-num) and $min > '1d2' )
      "/>
  </xsl:function>
  
  
</schema>
