
<pattern id="permissions-info" xmlns="http://purl.oclc.org/dsdl/schematron">

    <rule context="license">
        <report test="license-p[1]">
            INFO: The &lt;license-p> element is intended to be
            human-readable documentation, and any content is allowed, including, for example,
            &lt;ext-link> elements with URIs. Such URIs within the &lt;license-p> element will be
            ignored. (It is the responsibility of the content producer to ensure that the
            human-readable version of the license statement matches the (machine-readable) license
            URI.)
        </report>
        <report test="p[1]">
            INFO: The &lt;p> element in &lt;license> is intended to be
            human-readable documentation, and any content is allowed, including, for example,
            &lt;ext-link> elements with URIs. Such URIs within the &lt;license-p> element will be
            ignored. (It is the responsibility of the content producer to ensure that the
            human-readable version of the license statement matches the (machine-readable) license
            URI.)
        </report>
    </rule>

    <rule context="license/p | license/license-p">
        <report test="ext-link">
            INFO: Any link in the text of a license should be to a
            human-readable license that does not contradict the machine-readable lincense referenced
            at license/@xlink:href.
        </report>
    </rule>

    <rule context="copyright-statement">
        <report test="self::node()">
            INFO: The content of the &lt;copyright-statement> is intended
            for display; i.e. human consumption. Therefore, the contents of this element aren't
            addressed by these recommendations.
        </report>
    </rule>

    <rule context="copyright-holder">
        <report test="self::node()">
            INFO: The &lt;copyright-holder> element should identify the
            person or institution that holds the copyright. As yet, we have no recommendations
            regarding the manner in which that person or institution is identified (i.e. no
            recommendations for using any particular authority).
        </report>
    </rule>

</pattern>
