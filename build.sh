#!/bin/bash

echo "NPM install"
npm install 1> /dev/null

echo "Running Gulp && Gulp Watch"
gulp
