<?xml version="1.0" encoding="UTF-8"?>
<schema xmlns="http://purl.oclc.org/dsdl/schematron" queryBinding="xslt2">

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

</schema>
