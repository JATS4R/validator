
<pattern id="permissions-warnings" xmlns="http://purl.oclc.org/dsdl/schematron">

    <!-- <license> should have an @xlink:href to the license URI -->
    <rule context="license">
        <assert test="normalize-space(@xlink:href)">
            WARNING: &lt;license&gt; should have an @xlink:href
            that refers to a publicly available license.
        </assert>
    </rule>
    
    <!-- <copyright-statement> should be followed by a <copyright-holder> -->
    <rule context="copyright-statement">
        <assert test="following-sibling::copyright-holder">
            WARNING: If a &lt;copyright-statement&gt;
            is provided, &lt;copyright-holder&gt; should also be provided for
            machine-readability.
        </assert>
    </rule>
</pattern>
