<?xml version="1.0" encoding="UTF-8"?>
<!--
    Copyright (c) 2015 JATS4Reuse (https://jats4r.org)
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    -->
<!-- 
  Tests for permissions, JATS4R GitHub issues #2, #11, #13 
-->
<pattern id="permissions-errors" xmlns="http://purl.oclc.org/dsdl/schematron">
    <!-- <license> must not have a @license-type attribute -->
    <rule context="license">
        <report test="@license-type">
            ERROR: @license-type is not machine readable and therefore
            should not be used. License type information should be derived instead from the URI
            given in the @xlink:href attribute.
        </report>
    </rule>

    <!-- <copyright-statement> must be followed by a <copyright-year> -->
    <rule context="copyright-holder">
        <assert test="preceding-sibling::copyright-year">
            ERROR: The &lt;copyright-year> and
            &lt;copyright-holder> elements are intended for machine-readability. Therefore, when
            there is a copyright (i.e. the article is not in the public domain) we recommend that
            both of these elements be used. 
        </assert>
    </rule>
    
    <rule context="copyright-year">
        <assert test="following-sibling::copyright-holder">
            ERROR: The &lt;copyright-year> and
            &lt;copyright-holder> elements are intended for machine-readability. Therefore, when
            there is a copyright (i.e. the article is not in the public domain) we recommend that
            both of these elements be used. 
        </assert>

        <!-- <copyright-year> should be a 4-digit number -->
        <assert test="number() and number() &gt; 999 and number() &lt; 10000">
            ERROR: &lt;copyright-year&gt; must be a 4-digit year, not "<value-of select="."/>".
        </assert>
        <report test="normalize-space(string(.))!=string(.)">
            ERROR: &lt;copyright-year&gt; should
            not contain whitespace.
        </report>
    </rule>

</pattern>
