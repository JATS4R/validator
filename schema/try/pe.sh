java -jar $SAXON_JAR -s:pe.sch \
  -xsl:../../lib/iso-schematron-xslt2/iso_svrl_for_xslt2.xsl \
  -o:pe.xsl \
  generate-paths=yes \
  allow-foreign=true

java -jar $SAXON_JAR -s:pe.xml \
  -xsl:pe.xsl \
  -o:pe.svrl

