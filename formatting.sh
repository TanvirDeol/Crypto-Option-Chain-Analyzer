#!/bin/bash

# Usage: ./formatting.sh <filename_or_directory>
# This script formats Python code using black and sorts imports using isort.
# Provide the target file or directory as an argument to the script.

# Check if a parameter is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <filename_or_directory>"
  exit 1
fi

TARGET=$1

# Apply formatting
black $TARGET

# Sort imports
isort $TARGET