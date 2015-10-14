<?xml version="1.0" encoding="UTF-8"?>

<schema xmlns="http://purl.oclc.org/dsdl/schematron" queryBinding="xslt2" defaultPhase="errors">

    <ns prefix="mml" uri="http://www.w3.org/1998/Math/MathML"/>
    <ns prefix="xsi" uri="http://www.w3.org/2001/XMLSchema-instance"/>
    <ns prefix="xlink" uri="http://www.w3.org/1999/xlink"/>

    <phase id="errors">
        <active pattern="permissions-errors"/>
        <active pattern="math-errors"/>
    </phase>

    <phase id="warnings">
        <active pattern="permissions-errors"/>
        <active pattern="permissions-warnings"/>
        <active pattern="math-errors"/>
        <active pattern="math-warnings"/>
    </phase>

    <phase id="info">
        <active pattern="permissions-errors"/>
        <active pattern="permissions-warnings"/>
        <active pattern="permissions-info"/>
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
