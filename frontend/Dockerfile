FROM node:25-trixie AS build

WORKDIR /workspace/frontend

COPY frontend/package.json frontend/package-lock.json frontend/openapitools.json ./

RUN npm ci

# OpenAPI generation requires Java at build time.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openjdk-25-jdk-headless

COPY openapi.yml /workspace/openapi.yml
COPY frontend/ ./

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /workspace/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/frontend/dist /usr/share/nginx/html

EXPOSE 80
