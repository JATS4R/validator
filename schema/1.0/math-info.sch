<!-- 
  Tests for math formulae 
-->
<pattern id="math-info" xmlns="http://purl.oclc.org/dsdl/schematron">

    <rule context="disp-formula | inline-formula">
        <report test="alternatives">
            INFO: &lt;alternatives> may contain any combination of
            representations (&lt;graphic>, &lt;mml:math>, &lt;tex-math>) but where it is used, each
            representation should be correct, complete and logically equivalent with every other
            representation present. There is no explicit or implied preferred representation within
            &lt;alternatives>.
        </report>

        <report test="descendant::tex-math">
            INFO: The content of the &lt;tex-math> element should be math-mode
            LaTeX, without the delimiters that are normally used to switch into / out of math mode
            (\\[...\\], \\(...\\), $$...$$, etc.).
        </report>
    </rule>

</pattern>
