# process-schematron.sh

# Usage

if [ "$1" = "-h" ] || [ "$1" = "-?" ] || [ "$1" = "--help" ]
  then

    echo "Usage: process-schematron.sh [ <input-type> [ <phase> ] ]

This tool will build a combined Schematron file from a multiple-
file Schematron, validate it, and output an XSLT2 stylesheet
to run against an XML instance.

Arguments:
  <input-type> - either 'level' or 'topic'
  <phase> - one of the phases as defined in the original schematron file.
    For 'level', this can be one of 'errors', 'warnings', or 'info'.
    For 'topic', this can be either 'permissions' or 'math'.

If neither <input-type> nor <phase> is given, this will produce all of
the valid combinations of output files.
"

    exit 0
fi



# Sanity check

if [ "x$SAXON_JAR" = "x" ] || ! [ -e $SAXON_JAR ]
  then
    echo "==> Error: SAXON_JAR doesn't point to anything. Did you remember to run '. setup.sh'?"
    exit 2
fi

# FIXME: version number needs to be parameterized
IN_DIR=$JATS4R_SCHEMA/1.0
OUTPUT_DIR=$JATS4R_XSLT/1.0


# This shell subroutine does the actual work.
# Usage: process <input-type> [<phase>]
process()
{
  INPUT_TYPE=$1
  IN=jats4r-$INPUT_TYPE
  PHASE=$2

  IN_SCH=$IN_DIR/$IN.sch



  COMBINED_SCH=$IN-combined.sch
  if ! [ -e $COMBINED_SCH ]; then

    echo "==> Combining multiple Schematron into $COMBINED_SCH"
    java -jar $SAXON_JAR -xsl:$JATS4R_HOME/bin/combine-schematron.xsl -s:$IN_SCH -o:$COMBINED_SCH

    if [ $? -eq 0 ]
      then
        echo $1 Successfully combined $IN_SCH into $COMBINED_SCH
      else
        echo $1 Error: failed to combine $IN_SCH
        exit 2
    fi

    echo "==> Validating the combined schema $COMBINED_SCH"

    java com.thaiopensource.relaxng.util.Driver lib/isoSchematron.rng $COMBINED_SCH

    if [ $? -eq 0 ]
      then
        echo $IN_SCH is valid
      else
        echo Error: $IN_SCH is an invalid Schematron file 
        exit 2
    fi

  fi


  if [ -z "$PHASE" ]
    then 
      P=""
      OUT_XSL=$OUTPUT_DIR/$IN.xsl
    else
      P="phase=$PHASE"
      OUT_XSL=$OUTPUT_DIR/jats4r-$INPUT_TYPE-$PHASE.xsl
  fi

  echo "==> Generating the XSLT $OUT_XSL"
  java -jar $SAXON_JAR -versionmsg:off -s:$COMBINED_SCH -xsl:lib/iso-schematron-xslt2/iso_svrl_for_xslt2.xsl \
       -o:$OUT_XSL generate-paths=yes allow-foreign=true $P

#java -jar $SAXON_JAR -s:pe.sch \
#  -xsl:../../lib/iso-schematron-xslt2/iso_svrl_for_xslt2.xsl \
#  -o:pe.xsl \
#  generate-paths=yes \
#  allow-foreign=true



  if [ $? -ne 0 ]
    then
      echo "==> Error: Failed to translate Schematron $IN_SCH into XSLT $OUT_XSL"
      exit 2
    else
      echo "==> Successfully generated $OUT_XSL"
  fi
}

# Finally, generate the outputs:

if [ $# -ge 1 ]
  then
    process $1 $2
  else
    process level errors
    process level warnings
    process level info
    process topic permissions
    process topic math
fi

rm jats4r-*-combined.sch
