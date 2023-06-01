#!/bin/sh

set -e

CONFIG_FILE="./static/config.json"
TMP_FILE="/tmp/config.json"

# Check if config.json is mounted
if ! touch $CONFIG_FILE 2>/dev/null; then
  echo "can not modify config.json - ENV configuration will be ignored"
else
  # Apply ENV vars to temporary config.json
  jq '.API_BASE_URL = env.API_BASE_URL
        | .API_WITH_CREDENTIALS = env.API_WITH_CREDENTIALS 
        | .OIDC_ISSUER = env.OIDC_ISSUER
        | .OIDC_CLIENT_ID = env.OIDC_CLIENT_ID
        | .OIDC_SCOPE = env.OIDC_SCOPE
        | .OIDC_FLOW = env.OIDC_FLOW
        | .OIDC_LOGIN_BUTTON_TEXT = env.OIDC_LOGIN_BUTTON_TEXT' \
    $CONFIG_FILE > $TMP_FILE

  # Override default config file
  mv -f $TMP_FILE $CONFIG_FILE
fi

exec "$@"

