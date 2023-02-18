#!/bin/bash
DS=`date +i'%Y%m%d%H%M%S'`
rm -rf build
vite build
. "../scripts/semver.sh"
{
    echo "BUILD_DATE=$DS"
    echo "COMMIT_ID=$(git rev-parse HEAD)"
    echo "BRANCH=$(git rev-parse --abbrev-ref HEAD)"
    echo "TAG=$(git describe --tags)"
    echo "SEMVER=$SEMVER"
} > build/build