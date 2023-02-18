#!/bin/bash
DS=`date +i'%Y%m%d%H%M%S'`
scripts/./clean.sh
cd ./bin
cmake .. "-DCMAKE_TOOLCHAIN_FILE=/home/alfu64/.vcpkg/scripts/buildsystems/vcpkg.cmake"
make

SEMVER_MAJOR=1
SEMVER_MINOR=0
SEMVER_PATCH=0

for commit_title in `git log --all | tac | egrep -oh "(feat|feature|refactoring|refactor|fix|hotfix|config)\(.*?\)"`;do
    echo $commit_title
    commit_type="$(egrep -oh "^(milestone|feat|feature|refactoring|refactor|fix|hotfix|config)" <<< $commit_title)"
    description="$(egrep -oh "\(.*?\)$" <<< $commit_title)"
    if [[ "$commit_type" == "milestone" ]]; then
        echo "This is a new major release."
        SEMVER_MAJOR=$(($SEMVER_MAJOR + 1))
        SEMVER_MINOR=0
        SEMVER_PATCH=0
    elif [[ "$commit_type" == "feat" || "$commit_type" == "feature" ]]; then
        echo "This is a new feature."
        SEMVER_MINOR=$(($SEMVER_MINOR + 1))
        SEMVER_PATCH=0
    elif [[ "$commit_type" == "refactoring" || "$commit_type" == "refactor" ]]; then
        echo "This is a refactoring."
        SEMVER_MINOR=$(($SEMVER_MINOR + 1))
        SEMVER_PATCH=0
    elif [[ "$commit_type" == "fix"  || "$commit_type" == "hotfix" ]]; then
        echo "This is a bug fix."
        SEMVER_PATCH=$(($SEMVER_PATCH + 1))
    elif [[ "$commit_type" == "config" ]]; then
        echo "This is a configuration change."
        SEMVER_MINOR=$(($SEMVER_MINOR + 1))
        SEMVER_PATCH=0
    else
        echo "Unrecognized commit_type: $commit_type"
        SEMVER_MINOR=$(($SEMVER_MINOR + 1))
        SEMVER_PATCH=0
    fi
    echo "SEMVER=$SEMVER_MAJOR.$SEMVER_MINOR.$SEMVER_PATCH"
    echo "TITLE:$description TYPE:$commit_type"
done
{
    echo "BUILD_DATE=$DS"
    echo "COMMIT_ID=$(git rev-parse HEAD)"
    echo "BRANCH=$(git rev-parse --abbrev-ref HEAD)"
    echo "TAG=$(git describe --tags)"
    echo "SEMVER=$SEMVER_MAJOR.$SEMVER_MINOR.$SEMVER_PATCH"
} > build
cd ..

scripts/./clean.sh