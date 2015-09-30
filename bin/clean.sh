#!/bin/sh

# Sanity check - are we in the right place?
if ! [ -e validate.js ]
  then
    echo Error: missing validate.js.
    echo You must run this script from within the root of the validator repository.
    return
fi
export JATS4R_VALIDATOR_HOME=`pwd`

rm -rf lib jats/flat generated-xsl
