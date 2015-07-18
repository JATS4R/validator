JATS4R Validator
================


Contents
--------

The following are the directories and files in this repository, and what
they are for.

* ***index.html***, ***validate.js***, ***validate.css*** - the main validator
  files
* ***bin*** - Shell scripts and XSLT files
* ***samples*** - Some sample XML documents, used for testing
* ***schema*** - The Schematron source files. See [Schema sources](#schema-sources),
  below.
* ***assets*** - Some static resources, including some third party libraries.
* ***validate*** - The source code for the online client-side validator.
* ***dtds.yaml*** - A YAML data file describing all of the NLM and JATS DTDs.
* ***README.md*** - This file
* ***LICENSE***

The following directories are generated in the course of building the validator.

* ***lib*** - Third party libraries and tools. See [Dependencies, 
  libraries](#dependencies-libraries), below.
* ***dtds*** - Flattened versions of all of the NLM and JATS DTDs
* ***generated-xsl*** - This contains XSLT versions of the Schematron files. The contents
  here should not be edited directly.  See [Generating XSLTs from Schematron 
  sources](#generating-xslts-from-schematron-sources), below


Quick start
-----------

*The instructions on this page assume you'll be working in a *bash* shell.*

If you're in a hurry, here are the steps to get a working validator on your
system.

The validator is deployed as a static web site, so you'll need to have access to
a system with a web server such as Apache. Find a convenient location served by
that server, and execute the following:

```
git clone https://github.com/JATS4R/validator.git
cd validator
source bin/setenv.sh   # sets environment variables
setup.sh               # extracts libraries, etc.
process-schematron.sh  # processes the Schematron files
```

Then, open the `index.html` page in your browser, through the web server on your
system, and you should have a working validator.


Validation setup
----------------

More detailed instructions follow.

Whenever you open a new shell, to configure your environment, you must first 
source the *bin/setenv.sh* script, from this repository's root directory:

```
cd *repo dir*
source bin/setenv.sh
```

After initially cloning the repository, to configure the necessary tools, 
you'll need to run *bin/setup.sh*. This extracts several third party
libraries, and builds flattened versions of the JATS DTDs. It creates the
directorys `lib` and `dtds` that are used by the validator.

Finally, to build XSLT versions of the Schematron validation files, you'll
need to run *process-schematron.sh*.  This creates the directory
`generated-xsl`, and populates it with the needed XSLT files.

To clean up the working directory, and start from scratch, just run the
*clean.sh* script.








Dependencies
------------

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




