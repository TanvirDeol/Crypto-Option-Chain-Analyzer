#!/bin/bash

# Check if a parameter is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <filename_or_directory>"
  exit 1
fi

TARGET=$1

# Run ESLint
npx eslint $TARGET --fix

# Run Prettier
npx prettier --write $TARGET