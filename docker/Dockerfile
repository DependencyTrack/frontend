###############################
#         Build image         #
###############################
FROM node:lts-slim as build

# git is required for dependency installation
RUN apt update && apt install -y git

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Perform actual build
COPY . .
RUN npm run build

###############################
#       Production image      #
###############################
FROM nginxinc/nginx-unprivileged:stable-alpine

# jq is required for entrypoint script
USER root
RUN apk --no-cache add jq

COPY ./docker/etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

COPY --chown=101:101 --from=build /app/dist /app

# Specify the user to run as (in numeric format for compatibility with Kubernetes/OpenShift's SCC)
# Inherited from parent image
# See https://github.com/nginxinc/docker-nginx-unprivileged/blob/main/stable/alpine/Dockerfile#L139
USER 101

# Set default settings that may get overridden to empty values by
# the entrypoint script, if not explicitly provided by the user
ENV OIDC_SCOPE "openid profile email"

# Setup entrypoint
WORKDIR /app
COPY ./docker/docker-entrypoint.sh /docker-entrypoint.d/30-oidc-configuration.sh
