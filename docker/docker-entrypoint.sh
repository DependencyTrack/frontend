#!/bin/sh

set -e

# Check if config.json is mounted
if mount | grep '/static/config.json'; then
  echo "config.json is mounted from host - ENV configuration will be ignored"
else
  # Apply ENV vars to temporary config.json
  jq '.API_BASE_URL = env.API_BASE_URL
        | .OIDC_ISSUER = env.OIDC_ISSUER
        | .OIDC_CLIENT_ID = env.OIDC_CLIENT_ID
        | .OIDC_SCOPE = env.OIDC_SCOPE
        | .OIDC_FLOW = env.OIDC_FLOW
        | .OIDC_LOGIN_BUTTON_TEXT = env.OIDC_LOGIN_BUTTON_TEXT' \
    ./static/config.json > /tmp/config.json

  # Override default config file
  mv -f /tmp/config.json ./static/config.json
fi

exec "$@"
