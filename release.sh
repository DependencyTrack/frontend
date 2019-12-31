#!/usr/bin/env bash

clear
RELEASE_TYPE=patch
PS3='Select the type of release to perform: '
releaseTypes=("Major" "Minor" "Patch" "Major (pre-release)" "Minor (pre-release)" "Patch (pre-release)" "Quit")
select opt in "${releaseTypes[@]}"
do
    case $opt in
        "Major")
            RELEASE_TYPE=major
            ;;
        "Minor")
            RELEASE_TYPE=minor
            ;;
        "Patch")
            RELEASE_TYPE=patch
            ;;
        "Major (pre-release)")
            RELEASE_TYPE=premajor
            ;;
        "Minor (pre-release)")
            RELEASE_TYPE=preminor
            ;;
        "Patch (pre-release)")
            RELEASE_TYPE=prepatch
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

npm publish
if [[ "$?" -ne 0 ]] ; then
  echo 'Failed to publish package'; exit $rc
fi
