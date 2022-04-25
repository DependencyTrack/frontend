#!/bin/sh

set -e

# Check if config.json is mounted
if mount | grep '/static/config.json'; then
  echo "config.json is mounted from host - ENV configuration will be ignored"
else
  sed -i ./static/config.json \
    -e "s;\"API_BASE_URL\": \"\";\"API_BASE_URL\": \"${API_BASE_URL}\";" \
    -e "s;\"OIDC_ISSUER\": \"\";\"OIDC_ISSUER\": \"${OIDC_ISSUER}\";" \
    -e "s;\"OIDC_CLIENT_ID\": \"\";\"OIDC_CLIENT_ID\": \"${OIDC_CLIENT_ID}\";" \
    -e "s;\"OIDC_SCOPE\": \"openid email profile\";\"OIDC_SCOPE\": \"${OIDC_SCOPE}\";" \
    -e "s;\"OIDC_FLOW\": \"code\";\"OIDC_FLOW\": \"${OIDC_FLOW}\";" \
    -e "s;\"OIDC_LOGIN_BUTTON_TEXT\" : \"\";\"OIDC_LOGIN_BUTTON_TEXT\" : \"${OIDC_LOGIN_BUTTON_TEXT}\";"
fi

exec "$@"
