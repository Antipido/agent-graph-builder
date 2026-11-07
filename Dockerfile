# syntax=docker/dockerfile:1

# ==============================================================================
# Stage 1: dependencies — Install deterministic dependencies with layer caching
# ==============================================================================
FROM node:24.11.0-alpine3.21 AS dependencies
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ==============================================================================
# Stage 2: build — Compile TypeScript & bundle production assets with Vite
# ==============================================================================
FROM dependencies AS build
WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY . .
RUN npm run build

# ==============================================================================
# Stage 3: test — Static analysis & lint check during image build
# ==============================================================================
FROM build AS test
WORKDIR /app
RUN npm run lint

# ==============================================================================
# Stage 4: dev — Optional non-root development stage with hot-reload
# Usage: docker compose --profile dev up --build
# ==============================================================================
FROM dependencies AS dev
WORKDIR /app
ENV NODE_ENV=development

COPY --chown=node:node . .
USER node
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# ==============================================================================
# Stage 5: runtime — Minimal, hardened, non-root Nginx Alpine image
# Usage: docker compose up --build -d
# ==============================================================================
FROM nginx:1.27.3-alpine3.20 AS runtime

ARG APP_PORT=8080
ENV APP_PORT=${APP_PORT}

# Configure permissions so Nginx runs securely as non-root user `nginx`
RUN rm -rf /usr/share/nginx/html/* \
    && sed -i 's,/var/run/nginx.pid,/tmp/nginx.pid,g' /etc/nginx/nginx.conf \
    && chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d \
    && chmod -R 755 /var/cache/nginx /var/log/nginx

COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
