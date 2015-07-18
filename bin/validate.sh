if [ "$1" = "-h" ] || [ "$1" = "-?" ] || [ "$1" = "--help" ]
  then
    echo "Usage: ./validate.sh <jats-file> [ <phase> ]"
    echo " "
    echo "Validate a JATS article against one of the JATS4R schema.
Output is written into the report.xml file

Arguments:
  <jats-file> - the XML file to validate
  <phase> - one of:
    - errors - report only errors, for all topics
    - warnings - report warnings and errors, for all topics
    - info - report everything for all topics - this is the most verbose
    - math - report all info messages, warnings, and errors for the math topic
    - permissions - report all messages, for the permissions topic
"
    exit 0
fi

if [ $# -lt 1 ]
  then
    echo "Error: missing input file"
    exit 2
fi

if [ x$JATS4R_XSLT = x ]
  then
    echo "Error: you need to run bin/setup.sh first. See the README.md file."
    exit 2
fi

JATS_FILE=$1

if [ "$2" = "" ]
  then
    PHASE=errors
  else
    PHASE=$2
fi

# FIXME: The version number needs to be parameterized
XSLT=`ls $JATS4R_XSLT/0.1/jats4r-*$PHASE.xsl`

if [ "$JATS_CATALOG" = "" ]
  then 
    CATALOG_ARG=""
  else
    CATALOG_ARG="-catalog:$JATS_CATALOG"
fi

echo "Validating against $XSLT"

REPORT=report.xml
java net.sf.saxon.Transform $CATALOG_ARG -s:$JATS_FILE -xsl:$XSLT -o:$REPORT 

echo "Done.  Output is in $REPORT"

