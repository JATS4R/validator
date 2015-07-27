JATS4R Validator
================

Contents
--------

* [Files and directories](#files-and-directories)
* [Quick start](#quick-start)
* [Validation setup](#validation-setup)
* [Validating from the command line](#validating-from-the-command-line)
* [Schema sources](#schema-sources)
* [Generating XSLTs from Schematron sources](#generating-xslts-from-schematron-sources)
* [Testing](#testing)
* [Dependencies](#dependencies)


Files and directories
---------------------

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

* ***lib*** - Third party libraries and tools. See [Dependencies](#dependencies), below.
* ***dtds*** - Flattened versions of all of the NLM and JATS DTDs
* ***generated-xsl*** - This contains XSLT versions of the Schematron files. The contents
  here should not be edited directly.  See [Generating XSLTs from Schematron 
  sources](#generating-xslts-from-schematron-sources), below


Quick start
-----------

Note: the instructions on this page assume you'll be working in a *bash* shell.

Here are the steps to get a working validator on your system.

The validator is deployed as a static web site, so you'll need to have access to
a system with a web server such as Apache. Find a convenient location served by
that server, and execute the following:

```
git clone https://github.com/JATS4R/validator.git
cd validator
source bin/setenv.sh   # sets environment variables
setup.sh               # extracts libraries, etc., and processes schematron
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

After initially cloning the repository, in order to configure the necessary tools, 
you'll need to run 

```
bin/setup.sh
```

This does the following:

1. Extracts several third party libraries into the `lib` directory,
2. Builds flattened versions of the JATS DTDs, writing them into the `dtds` directory, and
3. Processes the schematron files, writing the results into `generated-xsl`.

If any changes are made to the Schematron files, you can rebuild them, without
rerunning the entire setup, by running 

```
bin/process-schematron.sh
```

To clean up the working directory, and start from scratch, just run

```
bin/clean.sh
```


Validating from the command line
--------------------------------

To validate a JATS file named sample.xml, use the script *validate.sh*. For example,

```
validate.sh samples/minimal.xml
```

This will give a report for compliance of 
the input file *minimal.xml* with respect to all topics (*math* and *permissions*).
By default, it only reports *errors*. If you want a full report (*info*, *warnings*,
and *errors*) then enter:

```
validate.sh samples/minimal.xml info
```

Use the `-h` switch to get a list of all the possible arguments.

If your setup requires an OASIS catalog file to resolve the DTDs for JATS
documents, you can use the environment variable JATS_CATALOG to point to that.

For example, you can download the [JATS Bundle](http://jatspan.org/jats-bundle.html)
to get all of the DTDs for several versions and flavors of JATS (up to NISO
JATS draft version 0.4), and unzip it, and then set the JATS_CATALOG environment
variable to point to the master catalog from that:

```
cd ~
wget http://jatspan.org/downloads/jats-core-bundle-0.8.zip
unzip jats-core-bundle-0.8.zip
export JATS_CATALOG=~/jatspacks/catalog.xml
```

Now, when you run *validate.sh*, it will automatically use that catalog file to
resolve any DTDs.  For example:

```
validate.sh samples/sample.xml
```


Schema sources
--------------

The master schema files are in Schematron format, in the *schema* subdirectory.

The "master" Schematron file, which determines conformance or non-conformance,
is *jats4r.sch*.  This includes all topics, but only the "error level" tests.

There are two other "master" Schematron files, which break down the tests in two different
ways: one by message severity (*info*, *warnings*, and *errors*) and one by 
topic (*math* and *permissions*).

The test files themselves are broken down into separate *modules*, by topic and
by severity level.
So, for example, *permissions-errors.sch*, *permissions-warnings.sch*, and 
*permissions-info.sch* define the tests for the permissions topic. 
All three run tests on permissions, but the permissions-errors reports only those 
things that are errors. 

In summary, the master Schematron files are:

* jats4r.sch - all topics, error level only
* jats4r-level.sch - groups tests by message severity level. Using this with
  `phase=info` (or `phase=#ALL`) will run all of the tests.
* jats4r-topic.sch - groups tests by topic. So, for example, when you run this
  with the `phase=math`, you will run just the math tests. 

The *generated-xsl* subdirectory contains XSLT2 files that have been generated from 
the Schematrons, using the *process-schematron.sh* script. 
These XSLT files must not be edited directly. If a change is made to a Schematron, a 
new XSLT should be auto-generated, using the process-schematron.sh script. 

When run against an instance, they will generate a report in [Schematron Validation 
Report Language XML](http://www.schematron.com/validators.html) (SVRL).


Generating XSLTs from Schematron sources
----------------------------------------

To generate new XSLT files in the generated-xsl directory, first, as described above,
you must source the *bin/setup.sh* script into your shell.

Then, use the script *process-schematron.sh* to convert the Schematron files into XSLT:

```
./process-schematron.sh
```

You can optionally pass this script an *input-type* (`level` or `topic`) and a 
*phase* (which depends on the *input-type*). Enter `./process-schematron.sh -h` 
for usage information.

This writes the output files into the *generated-xsl* directory.


Testing
-------

To test the online validator, use the files in the `samples` directory.

Automated tests coming soon.


How it works
------------

For information on this implementation of this tool, see the paper we submitted
to [Balisage 2015](http://balisage.net/2015/Program.html), "A client-side JATS4R
validator using Saxon-CE". The following is the data-flow diagram from that paper,
illustrating in a compact form what is happening under the hood.

![Data flow diagram](https://raw.githubusercontent.com/JATS4R/validator/master/assets/jats4r-validator-data-flow-small.png)


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




