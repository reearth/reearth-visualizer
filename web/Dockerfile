FROM node:20.18.0-slim AS builder
WORKDIR /app

ARG NODE_OPTIONS="--max-old-space-size=4096"
ARG GITHUB_SHA
ENV NODE_OPTIONS=$NODE_OPTIONS
ENV GITHUB_SHA=$GITHUB_SHA

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=cache,target=/root/.npm,sharing=locked \
    corepack enable

RUN --mount=type=bind,source=.yarnrc.yml,target=.yarnrc.yml \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn,sharing=locked \
    yarn install --frozen-lockfile

RUN --mount=type=bind,source=.yarnrc.yml,target=.yarnrc.yml \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=bind,source=index.html,target=index.html \
    --mount=type=bind,source=published.html,target=published.html \
    --mount=type=bind,source=tsconfig.json,target=tsconfig.json \
    --mount=type=bind,source=vite.config.ts,target=vite.config.ts \
    --mount=type=bind,source=src,target=src \
    --mount=type=cache,target=/root/.yarn,sharing=locked \
    yarn build

FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Quite the Nginx startup logs.
ENV NGINX_ENTRYPOINT_QUIET_LOGS=true

# Default to Cloud Run port.
# Ref: https://cloud.google.com/run/docs/reference/container-contract#port
ENV PORT=8080

# Defaults Google Cloud Load Balancer header.
# Ref: https://cloud.google.com/load-balancing/docs/https#target-proxies
ENV REAL_IP_HEADER=X-Forwarded-For

# Default values.
ENV REEARTH_WEB_API=null
ENV REEARTH_WEB_AUTH0_AUDIENCE=null
ENV REEARTH_WEB_AUTH0_CLIENT_ID=null
ENV REEARTH_WEB_AUTH0_DOMAIN=null
ENV REEARTH_WEB_CESIUM_ION_ACCESS_TOKEN=null
ENV REEARTH_WEB_CLOUD_API=null
ENV REEARTH_WEB_CURRENT_TOS=null
ENV REEARTH_WEB_DEVELOPER_MODE=null
ENV REEARTH_WEB_DOCUMENTATION_URL=null
ENV REEARTH_WEB_EARLY_ACCESS_ADMINS=[]
ENV REEARTH_WEB_EXTENSION_URLS=[]
ENV REEARTH_WEB_FAVICON_URL=
ENV REEARTH_WEB_IP=null
ENV REEARTH_WEB_MARKETPLACE_URL=null
ENV REEARTH_WEB_PASSWORD_POLICY=null
ENV REEARTH_WEB_PLUGINS=null
ENV REEARTH_WEB_POLICY=null
ENV REEARTH_WEB_PUBLISHED=null
ENV REEARTH_WEB_TITLE=

COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html
COPY --chown=nginx:nginx docker/nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY --chown=nginx:nginx docker/40-envsubst-on-reearth-config.sh /docker-entrypoint.d
COPY --chown=nginx:nginx docker/reearth_config.json.template /opt/reearth/reearth_config.json.template

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
