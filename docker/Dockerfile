FROM nginx:stable-alpine

# jq is required for entrypoint script
RUN apk --no-cache add jq

COPY ./docker/etc/nginx/nginx.conf /etc/nginx/nginx.conf

COPY ./dist /app

# Set default settings that may get overridden to empty values by
# the entrypoint script, if not explicitly provided by the user
ENV OIDC_SCOPE "openid profile email"

# Setup entrypoint
WORKDIR /app
COPY ./docker/docker-entrypoint.sh /usr/bin/docker-entrypoint.sh
ENTRYPOINT [ "/usr/bin/docker-entrypoint.sh" ]

# Inherited from parent image
# See https://github.com/nginxinc/docker-nginx/blob/1.18.0/stable/alpine/Dockerfile#L115
CMD ["nginx", "-g", "daemon off;"]
