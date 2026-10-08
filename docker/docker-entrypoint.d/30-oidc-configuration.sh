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
  feature_flags="$(jq -r '.FEATURE_FLAGS // {}' ./static/config.json)"
  for feature_flag_var in $(env | grep '^FEATURE_FLAG_' | cut -d= -f1); do
    feature_name=$(echo "${feature_flag_var}" | sed 's/^FEATURE_FLAG_//')
    eval "feature_value=\$${feature_flag_var}"
    entrypoint_log "$ME: info: ${feature_name}=${feature_value}"
    feature_flags=$(echo "${feature_flags}" | jq --arg name "${feature_name}" --argjson enabled "${feature_value}" '. + {($name): $enabled}')
  done

  CONFIG=$(jq --argjson feature_flags "${feature_flags}" \
        '.API_BASE_URL = env.API_BASE_URL
        | .API_WITH_CREDENTIALS = env.API_WITH_CREDENTIALS
        | .AUTH_TOKEN_STORAGE = env.AUTH_TOKEN_STORAGE
        | .FEATURE_FLAGS = $feature_flags
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
