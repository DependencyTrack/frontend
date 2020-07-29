#!/bin/sh

set -e

if [ -z "$API_BASE_URL" ]; then
    echo "Mandatory \$API_BASE_URL not set"
    exit 1
fi

# Apply ENV vars to temporary config.json
jq  --arg apiBaseUrl "$API_BASE_URL" \
    --arg oidcIssuer "$OIDC_ISSUER" \
    --arg oidcClientId "$OIDC_CLIENT_ID" \
    --arg oidcFlow "$OIDC_FLOW" \
    '.API_BASE_URL = $apiBaseUrl 
        | .OIDC_ISSUER = $oidcIssuer 
        | .OIDC_CLIENT_ID = $oidcClientId 
        | .OIDC_FLOW = $oidcFlow' \
    ./static/config.json > /tmp/config.json

# Override default config file
mv -f /tmp/config.json ./static/config.json

exec "$@"
