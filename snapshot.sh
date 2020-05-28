#!/usr/bin/env bash

clear

npm run build
if [[ "$?" -ne 0 ]] ; then
  echo 'Aborting snapshot release due to build failure'; exit $rc
fi

PACKAGE_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
zip -r frontend-dist.zip dist/*
echo Publishing $PACKAGE_VERSION to GitHub Releases
# pip install githubrelease
# https://github.com/j0057/github-release
githubrelease release dependencytrack/frontend create $PACKAGE_VERSION \
  --name $PACKAGE_VERSION --body "Dependency-Track Frontend" \
  --publish bom.xml frontend-dist.zip \
  --prerelease
