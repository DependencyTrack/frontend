#!/usr/bin/env bash

clear
RELEASE_TYPE=patch
PS3='Select the type of release to perform: '
releaseTypes=("Major" "Minor" "Patch" "Quit")
select opt in "${releaseTypes[@]}"
do
    case $opt in
        "Major")
            RELEASE_TYPE=major
            break
            ;;
        "Minor")
            RELEASE_TYPE=minor
            break
            ;;
        "Patch")
            RELEASE_TYPE=patch
            break
            ;;
        "Quit")
            break
            ;;
        *) echo "invalid option $REPLY";;
    esac
done

npm version $RELEASE_TYPE
if [[ "$?" -ne 0 ]] ; then
  echo 'Aborting release due to version incremental failure. Ensure there are no modified/uncommitted files in the repo'; exit $rc
fi

npm run build
if [[ "$?" -ne 0 ]] ; then
  echo 'Aborting release due to build failure'; exit $rc
fi

PACKAGE_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
zip -r frontend-dist.zip dist/*
echo Publishing $PACKAGE_VERSION to GitHub Releases
# pip install githubrelease
# https://github.com/j0057/github-release
githubrelease release dependencytrack/frontend create $PACKAGE_VERSION \
  --name $PACKAGE_VERSION --body "Dependency-Track Frontend" \
  --publish bom.xml bom.json frontend-dist.zip

REPO=dependencytrack/frontend
docker rmi $REPO:latest
docker rmi $REPO:$PACKAGE_VERSION
docker build -f docker/Dockerfile -t $REPO:$PACKAGE_VERSION -t $REPO:latest .
docker login
docker push $REPO:latest
docker push $REPO:$PACKAGE_VERSION
