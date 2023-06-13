#!/bin/sh

set -e

CONFIG_FILE="./static/config.json"
TEMPLATE_FILE="./static/config.tmpl.json"

# Check if config.json exists
if test -f $CONFIG_FILE; then
  echo "config.json already exists - ENV variables will be ignored"
else
  echo "Creating config.json using ENV variables"
  jq '.API_BASE_URL = env.API_BASE_URL
        | .API_WITH_CREDENTIALS = env.API_WITH_CREDENTIALS
        | .OIDC_ISSUER = env.OIDC_ISSUER
        | .OIDC_CLIENT_ID = env.OIDC_CLIENT_ID
        | .OIDC_SCOPE = env.OIDC_SCOPE
        | .OIDC_FLOW = env.OIDC_FLOW
        | .OIDC_LOGIN_BUTTON_TEXT = env.OIDC_LOGIN_BUTTON_TEXT' \
    $TEMPLATE_FILE > $CONFIG_FILE
fi

exec "$@"
