###############################
#         Build image         #
###############################
FROM node:lts as build

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
FROM nginx:stable-alpine

# jq is required for entrypoint script
RUN apk --no-cache add jq
 
COPY ./docker/etc/nginx/nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/dist /app

# Setup entrypoint
WORKDIR /app
COPY ./docker/docker-entrypoint.sh /usr/bin/docker-entrypoint.sh
ENTRYPOINT [ "/usr/bin/docker-entrypoint.sh" ]

# Inherited from parent image
# See https://github.com/nginxinc/docker-nginx/blob/1.18.0/stable/alpine/Dockerfile#L115
CMD ["nginx", "-g", "daemon off;"]
