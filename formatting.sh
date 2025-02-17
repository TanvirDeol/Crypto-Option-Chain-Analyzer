#!/bin/bash

# Check if a parameter is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <filename_or_directory>"
  exit 1
fi

TARGET=$1

# Apply autopep8 fixes
autopep8 --in-place --aggressive --aggressive --recursive $TARGET

# Apply black formatting
black $TARGET

# Sort imports with isort
isort $TARGET