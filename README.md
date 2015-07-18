# JATS4R Validator



## Dependencies

This tool has a number of dependencies. Some are system tools, that
are present on many Unix systems, or that can be installed easily,
and others are fetched and installed by the
`bin/setup.sh` script.

### System tools

You'll need to make sure that your system has the following.

* wget
* Java version 7 or later
* Python 3
* The Python pyyaml module


### EcmaScript 6 Promise polyfill

Polyfill for the `Promise` feature.

This was downloaded from the [GitHub 
jakearchibald/es6-promise repo](https://github.com/jakearchibald/es6-promise),
specifically, [this 
version](https://github.com/jakearchibald/es6-promise/raw/$TAG/dist/es6-promise.min.js), and put into `assets/es6-promise.min.js`.

In setup.sh, this is copied into `lib/es6-promise.min.js`.


### Fetch polyfill

Polyfill for the EcmaScript 6 `fetch` feature.
From the [GitHub github/fetch repo](https://github.com/github/fetch), [this 
version](https://github.com/github/fetch/raw/9d08342b6bbdb8b32fe1766677c1720f460a3268/fetch.js)
was downloaded and put into the `assets` directory.

In setup.sh, this is copied to `lib/fetch.js`.


### Saxon CE 1.1

Open-source client-side XSLT 2.0 processor.

Can be downloaded from [this page](http://www.saxonica.com/ce/index.xml#download).

In setup.sh, this is downloaded and extracted to `lib/Saxonce`.


### xmllint.js

For now, this is saved in this repository in the `assets` directory.
This is a creation of Alf Eaton -- see his [hubgit/xml.js 
repo](https://github.com/hubgit/xml.js).

The setup.sh script copies this into `lib`.


### NLM and JATS DTDs

The setup.sh script downloads these from the 
[NCBI/nlm-dtd](https://github.com/ncbi/nlm-dtd) and 
[NCBI/niso-jats](https://github.com/ncbi/niso-jats) repositories, and 
extracts under the `lib` directory.


### DtdAnalyzer

This tool is used by the flatten.py script, to flatten each of the various JATS DTDs.

In setup.sh, this is downloaded into the `lib/DtdAnalyzer-0.5` directory. 


### Saxon Home Edition

The saxon9he.jar file is included with the DtdAnalyzer.


### Schematron schema

This is the schema that defines what is a valid Schematron file. This version is from 2005, and is included here as assets/isoSchematron.rng.

The setup.sh script copies this into `lib`.


### Jing

This was originally downloaded from 
[here](http://jing-trang.googlecode.com/files/jing-20081028.zip), 
and was added to the `assets` directory of this repository.

The setup.sh script extracts this into `lib/jing-20081028`.


### Schematron XSLT

Downloaded from 
[here](http://www.schematron.com/tmp/iso-schematron-xslt2.zip) on 2015-04-02, 
and included as `assets/iso-schematron-xslt2.zip`.

The setup.sh script extracts this into `lib/iso-schematron-xslt2`.


### Apache Commons OASIS catalog resolver

Downloaded from 
[here](http://apache.mirrors.pair.com//xerces/xml-commons/xml-commons-resolver-1.2.zip)
on 2015-04-02, and included as assets/xml-commons-resolver-1.2.zip.

The setup.sh script extracts this into `lib/xml-commons-resolver-1.2`.




