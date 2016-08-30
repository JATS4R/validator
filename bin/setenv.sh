# Set environment.
# This script should be sourced from a bash shell.


# Sanity check - are we in the right place?
if ! [ -e validate.js ]
  then
    echo Error: missing validate.js.
    echo You must run this script from within the root of the JATS4R validator 
    echo repository.
    return
fi
export JATS4R_HOME=`pwd`

# Create virtualenv if needed; and activate it
if ! [ -x env/bin/activate ]; then
  virtualenv -p python3 env
  pip install -r requirements.txt
fi
. env/bin/activate

export DTDANALYZER_HOME=$JATS4R_HOME/lib/DtdAnalyzer-0.5
export SAXON_JAR=$DTDANALYZER_HOME/lib/saxon9he.jar
export JING_HOME=$JATS4R_HOME/lib/jing-20081028
export JING_BIN=$JING_HOME/bin
export SCHEMATRON=$JATS4R_HOME/lib/iso-schematron-xslt2
export RESOLVER_JAR=$JATS4R_HOME/lib/xml-commons-resolver-1.2/resolver.jar

CLASSPATH=$SAXON_JAR
CLASSPATH=$CLASSPATH:$JING_BIN/isorelax.jar
CLASSPATH=$CLASSPATH:$JING_BIN/jing.jar
CLASSPATH=$CLASSPATH:$JING_BIN/xercesImpl.jar
CLASSPATH=$CLASSPATH:$JING_BIN/xml-apis.jar
CLASSPATH=$CLASSPATH:$RESOLVER_JAR
export CLASSPATH

export PATH=$JATS4R_HOME/bin:$PATH

export JATS4R_SCHEMA=$JATS4R_HOME/schema
export JATS4R_XSLT=$JATS4R_HOME/generated-xsl
