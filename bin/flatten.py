#!/usr/bin/env python3

# Run this with, for example,
#     JATS_DTD_BASE=~/github/ncbi python3 flatten.py
# Flattened versions of the DTDs will be written to the `dtds` subdirectory.
#
# Depends on:
# - Python3
# - Python package pyyaml
# - Java
# - DtdAnalyzer

import sys
import os
import yaml
import subprocess
import rnginline



# This is the base directory of where all the original DTD files reside
jats_dtd_base = os.environ.get('JATS_DTD_BASE') or "."

# Where to put our flattened DTDs
flat_base = 'dtds'

# Read the YAML database
with open("jats-schema.yaml", "r") as stream:
    dtds_db = yaml.load(stream)

dtds = dtds_db['dtds']
print("Generating flattened DTDs:")
for dtd in dtds:
    path = dtd['path']   # e.g. 'nlm-dtd/archiving/1.0/dtd/archivearticle.dtd'
    dirname = os.path.dirname(path)  # e.g. 'nlm-dtd/archiving/1.0/dtd'
    orig_dtd_path = jats_dtd_base + "/" + path
    
    # Make the destination directory, where the flattened DTD will be written
    flat_dirname = flat_base + "/" + dirname
    os.makedirs(flat_dirname, exist_ok = True)
    flat_path = flat_base + "/" + path

    subprocess.call('dtdflatten ' + orig_dtd_path + ' > ' + flat_path, shell=True)
    print("  " + flat_path)

print("Generating flattened RNGs:")
for dtd in dtds:
    path = dtd['path']   # e.g. 'nlm-dtd/archiving/1.0/dtd/archivearticle.dtd'
    path = path.replace("/dtd/", "/rng/")
    path = path.replace(".dtd", ".rng")


    dirname = os.path.dirname(path)  # e.g. 'nlm-dtd/archiving/1.0/rng'
    orig_rng_path = jats_dtd_base + "/" + path
    if (not(os.path.isfile(orig_rng_path))): continue
    
    # Make the destination directory, where the flattened DTD will be written
    flat_dirname = flat_base + "/" + dirname
    os.makedirs(flat_dirname, exist_ok = True)
    flat_path = flat_base + "/" + path

    subprocess.call('rnginline ' + orig_rng_path + ' ' + flat_path, shell=True)
    print("  " + flat_path)


