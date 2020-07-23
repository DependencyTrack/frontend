#!/bin/sh

set -e

jq  --arg apiBaseUrl "$API_BASE_URL" \
    --arg oidcIssuer "$OIDC_ISSUER" \
    --arg oidcClientId "$OIDC_CLIENT_ID" \
    --arg oidcFlow "$OIDC_FLOW" \
    '.API_BASE_URL = $apiBaseUrl | .OIDC_ISSUER = $oidcIssuer | .OIDC_CLIENT_ID = $oidcClientId | .OIDC_FLOW = $oidcFlow' \
    ./static/config.json > ./static/config.json.new
mv -f ./static/config.json.new ./static/config.json

exec "$@"
