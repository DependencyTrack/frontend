#!/bin/sh

set -e

entrypoint_log() {
    if [ -z "${NGINX_ENTRYPOINT_QUIET_LOGS:-}" ]; then
        echo "$@"
    fi
}

ME=$(basename $0)

if ! touch ./static/config.json 2>/dev/null; then
  entrypoint_log "$ME: info: can not modify config.json - ENV configuration will be ignored"
else
  CONFIG=$(jq '.API_BASE_URL = env.API_BASE_URL
        | .API_WITH_CREDENTIALS = env.API_WITH_CREDENTIALS
        | .OIDC_ISSUER = env.OIDC_ISSUER
        | .OIDC_CLIENT_ID = env.OIDC_CLIENT_ID
        | .OIDC_SCOPE = env.OIDC_SCOPE
        | .OIDC_FLOW = env.OIDC_FLOW
        | .OIDC_LOGIN_BUTTON_TEXT = env.OIDC_LOGIN_BUTTON_TEXT' \
    ./static/config.json)
  echo "${CONFIG}" > ./static/config.json
  entrypoint_log "$ME: info: effective config: $(echo "${CONFIG}" | jq -c '.')"
fi

exec "$@"
