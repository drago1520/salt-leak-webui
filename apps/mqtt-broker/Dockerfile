FROM oven/bun:1.3.12-alpine AS base
WORKDIR /app

# Copy workspace manifests for dependency resolution
COPY package.json bun.lock ./
COPY packages/ts-config/package.json    ./packages/ts-config/package.json
COPY packages/shared/package.json       ./packages/shared/package.json
COPY packages/db/package.json           ./packages/db/package.json
COPY apps/mqtt-broker/package.json      ./apps/mqtt-broker/package.json
COPY apps/salt-leak-sensor/package.json ./apps/salt-leak-sensor/package.json
COPY apps/web/package.json              ./apps/web/package.json

# Install all dependencies (workspace-aware)
RUN bun install --frozen-lockfile

# Copy source
COPY packages/ts-config/ ./packages/ts-config/
COPY packages/shared/src/ ./packages/shared/src/
COPY packages/db/src/     ./packages/db/src/
COPY apps/mqtt-broker/    ./apps/mqtt-broker/

WORKDIR /app/apps/mqtt-broker

ENV NODE_ENV=production

EXPOSE 1883
EXPOSE 4000

CMD ["bun", "index.ts"]
