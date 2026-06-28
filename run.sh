#!/bin/bash
#
# script to run on localhost
#

set -o errexit
set -o pipefail
set -o nounset

if [ ! -d "node_modules" ]; then
    echo "INFO: installing dependencies"
    npm install
fi

npm run dev
