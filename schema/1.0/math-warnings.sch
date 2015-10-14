<!-- 
  Tests for math formulae 
-->

<pattern id="math-warnings" xmlns="http://purl.oclc.org/dsdl/schematron">

    <rule context="disp-formula | inline-formula">        
        <!--
          The use of images to represent mathematical expressions is strongly discouraged. Math 
          should be marked up within <inline-formula> and <disp-formula> using either <tex-math> 
          or <mml:math>.
  		-->
        <report test="(graphic or inline-graphic) and not(mml:math or tex-math)">
            WARNING: All
            mathematical expressions should be provided in markup using either &lt;mml:math&gt; or
            &lt;tex-math&gt;. The only instance in which the graphic representation of a
            mathematical expression should be used outside of &lt;alternatives> and without the
            equivalent markup is where that expression is so complicated that it cannot be
            represented in markup at all.
        </report>
    </rule>
</pattern>
