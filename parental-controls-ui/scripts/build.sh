#!/bin/bash
DS=`date +'%Y%m%d%H%M%S'`
rm -rf dist
vite build
cp ../scripts/fileserve-static.sh dist/
. "../scripts/semver.sh"
{
    echo "{"
    echo "    \"BUILD_DATE\":\"$DS\","
    echo "    \"COMMIT_ID\":\"$(git rev-parse HEAD)\","
    echo "    \"BRANCH\":\"$(git rev-parse --abbrev-ref HEAD)\","
    echo "    \"TAG\":\"$(git describe --tags)\","
    echo "    \"SEMVER\":\"$SEMVER\""
    echo "}"
} > dist/build.json
