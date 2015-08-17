#!/bin/sh

# Sanity check - has setenv.sh been sourced?
if [ -z "$JATS4R_HOME" ]; then
    echo "Error: JATS4R_HOME is not set."
    echo "You need to run 'source bin/setenv.sh'."
    exit 1
fi  


cd $JATS4R_HOME
mkdir -p lib


# Chosen
cd $JATS4R_HOME/lib
if ! [ -d chosen ]; then
    mkdir -p chosen
    cd chosen
    wget https://github.com/harvesthq/chosen/releases/download/1.4.2/chosen_v1.4.2.zip
    if [ $? -ne 0 ]; then
        echo "wget chosen failed; aborting"
        exit 1
    fi
    unzip chosen_v1.4.2.zip
fi

# Spin.js
cd $JATS4R_HOME/lib
if ! [ -e spin.min.js ]; then
    wget https://raw.githubusercontent.com/fgnass/spin.js/2.3.2/spin.min.js
    if [ $? -ne 0 ]; then
        echo "wget spin.min.js failed; aborting"
        exit 1
    fi
fi

# Saxon CE 1.1
cd $JATS4R_HOME/lib
if ! [ -d Saxonce ]; then
    wget http://www.saxonica.com/ce/download/Saxon-CE_1.1.zip
    if [ $? -ne 0 ]; then
        echo "wget failed; aborting"
        exit 1
    fi
    unzip Saxon-CE_1.1.zip 'Saxonce/*'
    rm Saxon-CE_1.1.zip
fi

# JATS DTDs

cd $JATS4R_HOME/lib

if ! [ -d nlm-dtd ]; then
    COMMIT=c8ad958f6190313807b2aa376a38537148f6c7d6
    wget https://github.com/ncbi/nlm-dtd/archive/$COMMIT.zip
    if [ $? -ne 0 ]; then
        echo "wget failed; aborting"
        exit 1
    fi
    unzip $COMMIT.zip
    rm $COMMIT.zip
    mv nlm-dtd-$COMMIT nlm-dtd
fi

if ! [ -d niso-jats ]; then
    COMMIT=1b907a30b52e272203217c62b0e04898da74b33d
    wget https://github.com/ncbi/niso-jats/archive/$COMMIT.zip
    if [ $? -ne 0 ]; then
        echo "wget failed; aborting"
        exit 1
    fi
    unzip $COMMIT.zip
    rm $COMMIT.zip
    mv niso-jats-$COMMIT niso-jats
fi

# DtdAnalyzer
cd $JATS4R_HOME/lib
if ! [ -d DtdAnalyzer-0.5 ]; then
    wget http://dtd.nlm.nih.gov/ncbi/dtdanalyzer/downloads/DtdAnalyzer-0.5.zip
    if [ $? -ne 0 ]; then
        echo "wget failed; aborting"
        exit 1
    fi
    unzip DtdAnalyzer-0.5.zip
    rm DtdAnalyzer-0.5.zip
fi
export DTDANALYZER_HOME=$JATS4R_HOME/lib/DtdAnalyzer-0.5
export PATH=$PATH:$DTDANALYZER_HOME

# Generate flattened DTDs in the `dtds` subdirectory
cd $JATS4R_HOME
if ! [ -d dtds ]; then
    JATS_DTD_BASE=lib python3 bin/flatten.py
    if [ $? -ne 0 ]; then
        echo "flatten failed; aborting"
        exit 1
    fi
fi

# Saxon
export SAXON_JAR=$DTDANALYZER_HOME/lib/saxon9he.jar

# Schematron schema
cd $JATS4R_HOME/lib
if ! [ -e isoSchematron.rng ]; then
    cp ../assets/isoSchematron.rng .
fi

# Jing
cd $JATS4R_HOME/lib
if ! [ -d jing-20081028 ]; then
    unzip ../assets/jing-20081028.zip
fi

# Schematron XSLT
cd $JATS4R_HOME/lib
if ! [ -d iso-schematron-xslt2 ]; then
    unzip -d iso-schematron-xslt2 ../assets/iso-schematron-xslt2.zip
fi

# Apache Commons OASIS catalog resolver
cd $JATS4R_HOME/lib
if ! [ -d xml-commons-resolver-1.2 ]; then
    unzip ../assets/xml-commons-resolver-1.2.zip
fi


# Finally, process the schematron
cd $JATS4R_HOME
bin/process-schematron.sh

