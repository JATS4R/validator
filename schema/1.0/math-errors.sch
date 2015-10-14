<!-- 
  Tests for math formulae 
-->
<pattern id="math-errors" xmlns="http://purl.oclc.org/dsdl/schematron">
    <rule context="mml:math | tex-math">
      <!--
        All mathematical expressions should be enclosed in an <inline-formula> element (for 
        expressions within the flow of text) or a <disp-formula> element (for display equations).
	    -->
        <assert test="ancestor::disp-formula or ancestor::inline-formula">
            ERROR: Math expressions must be in &lt;disp-formula&gt; or &lt;inline-formula&gt; 
            elements. They should not appear directly in 
            &lt;<value-of select="name(parent::node())"/>&gt;.
        </assert>
    </rule>

    <rule context="disp-formula | inline-formula">
        <assert test="count(child::graphic) + count(child::tex-math) + 
                      count(child::mml:math) &lt; 2">
            ERROR: Formula element should contain only one expression. If these are alternate
            representations of the same expression, use &lt;alternatives&gt;. If they are different
            expressions, tag each in its own &lt;<value-of select="name()"/>&gt;.
        </assert>
    </rule>
    
    <rule context="disp-formula/alternatives | inline-formula/alternatives">
        <assert test="count(child::graphic) + count(child::inline-graphic) &lt;= 1 and 
                      count(child::tex-math) &lt;= 1 and
                      count(child::mml:math) &lt;= 1">
            ERROR: For alternate representations of the same expression, there can be at most
            one of each type of representation (graphic or inline-graphic, tex-math, and mml:math).
        </assert>
    </rule>

</pattern>
