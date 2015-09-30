#!/usr/bin/env python3

# Run this with, for example,
#     JATS_BASE=~/github/ncbi python3 flatten.py
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
jats_base = os.environ.get('JATS_BASE') or "."

# Where to put our flattened DTDs
flat_base = 'flat'

# Read the YAML database
with open("jats.yaml", "r") as stream:
    jats_db = yaml.load(stream)

jats = jats_db['schema']
print("Generating flattened DTDs:")
for schema_def in jats:
    # Get the path to DTD; e.g. 'src/nlm-dtd/archiving/1.0/dtd/archivearticle.dtd'
    rel_path = schema_def['repo_base_path'] + "/" + schema_def['dtd']['repo_path']
    dirname = os.path.dirname(rel_path)  # e.g. 'nlm-dtd/archiving/1.0/dtd'
    src_path = jats_base + "/src/" + rel_path
    
    # Make the destination directory, where the flattened DTD will be written
    flat_dir = flat_base + "/" + dirname
    os.makedirs(flat_dir, exist_ok = True)
    flat_path = flat_base + "/" + rel_path

    subprocess.call('dtdflatten ' + src_path + ' > ' + flat_path, shell=True)
    print("  " + flat_path)


print("Generating flattened RNGs:")
for schema_def in jats:
    # Get the path to RNG; e.g. 'src/nlm-dtd/archiving/1.0/rng/archivearticle.rng'
    rel_path = schema_def['repo_base_path'] + "/" + schema_def['rng']['repo_path']
    dirname = os.path.dirname(rel_path)  # e.g. 'nlm-dtd/archiving/1.0/dtd'
    src_path = jats_base + "/src/" + rel_path
    
    # Make the destination directory, where the flattened RNG will be written
    flat_dir = flat_base + "/" + dirname
    os.makedirs(flat_dir, exist_ok = True)
    flat_path = flat_base + "/" + rel_path

    subprocess.call('rnginline ' + src_path + ' ' + flat_path, shell=True)
    print("  " + flat_path)

exit(0)
