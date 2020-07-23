FROM node:lts as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine
RUN apk --no-cache add jq
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /app
WORKDIR /app
COPY ./docker/docker-entrypoint.sh /usr/bin/docker-entrypoint.sh
ENTRYPOINT [ "/usr/bin/docker-entrypoint.sh" ]
CMD ["nginx", "-g", "daemon off;"]