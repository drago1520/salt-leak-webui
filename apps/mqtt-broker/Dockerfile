FROM oven/bun:1.3.12-alpine AS base
WORKDIR /app

# Prune workspace for @repo/mqtt-broker
FROM base AS pruner
RUN bun install -g turbo
COPY . .
RUN turbo prune @repo/mqtt-broker --docker

# Install deps from pruned lockfile
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,target=/root/.bun/install/cache bun install

# Copy full source
FROM installer AS runner
COPY --from=pruner /app/out/full/ .
ENV NODE_ENV=production
ARG MQTT_PORT=1883
ARG WS_PORT=4000

ENV MQTT_PORT=${MQTT_PORT}
ENV WS_PORT=${WS_PORT}

EXPOSE ${MQTT_PORT}
EXPOSE ${WS_PORT}
WORKDIR /app/apps/mqtt-broker
CMD ["bun", "index.ts"]
