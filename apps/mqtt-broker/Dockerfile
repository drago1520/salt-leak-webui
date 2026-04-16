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
COPY --from=pruner /app/out/full/bun.lock ./bun.lock
RUN bun install

# Copy full source
FROM installer AS runner
COPY --from=pruner /app/out/full/ .
ENV NODE_ENV=production

EXPOSE 1883
EXPOSE 4000
WORKDIR /app/apps/mqtt-broker
CMD ["bun", "index.ts"]
