FROM oven/bun:1.3.12-alpine AS base
WORKDIR /app

# Prune workspace for @repo/salt-leak-sensor
FROM base AS pruner
COPY . .
RUN bun i -g turbo
RUN turbo prune @repo/salt-leak-sensor --docker

# Install deps with bun (project uses bun.lock)
FROM base AS installer
COPY --from=pruner /app/out/json/ .
RUN bun install

# Runtime
FROM node:25.9.0-alpine AS runner
COPY --from=pruner /app/out/full/ .
COPY --from=installer /app/node_modules ./node_modules
ENV NODE_ENV=production
WORKDIR /app/apps/salt-leak-sensor
CMD ["npm", "run", "listen"]
