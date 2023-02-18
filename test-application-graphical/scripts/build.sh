#!/bin/bash
DS=`date +i'%Y%m%d%H%M%S'`
scripts/./clean.sh
cd ./bin
cmake .. "-DCMAKE_TOOLCHAIN_FILE=/home/alfu64/.vcpkg/scripts/buildsystems/vcpkg.cmake"
make
{
    echo "BUILD_DATE=$DS"
    echo "COMMIT_ID=$(git rev-parse HEAD)"
    echo "BRANCH=$(git rev-parse --abbrev-ref HEAD)"
    echo "TAG=$(git describe --tags)"
} > build
cd ..

scripts/./clean.sh