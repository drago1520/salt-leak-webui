FROM oven/bun:1.3.12-alpine AS base
WORKDIR /app

# Prune workspace for @repo/notifications
FROM base AS pruner
RUN bun install -g turbo
COPY . .
RUN turbo prune @repo/notifications --docker

# Install deps from pruned lockfile
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,target=/root/.bun/install/cache bun install

# Copy full source
FROM installer AS runner
COPY --from=pruner /app/out/full/ .
ENV NODE_ENV=production
ARG WS_PORT=4001
ENV WS_PORT=${WS_PORT}

EXPOSE ${WS_PORT}
WORKDIR /app/apps/notifications
CMD ["bun", "--preload", "./instrument.ts", "index.ts"]
