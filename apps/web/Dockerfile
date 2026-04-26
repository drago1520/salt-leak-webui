FROM oven/bun:1.3.12-alpine AS base
RUN bun install -g turbo
WORKDIR /app

# Prune workspace for @repo/web
FROM base AS pruner
COPY . .
RUN turbo prune @repo/web --docker

# Install deps from pruned lockfile
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,target=/root/.bun/install/cache bun install

# Build with full source
FROM installer AS builder
COPY --from=pruner /app/out/full/ .
#TODO: build variables if NOT coolify. Coolify auto injects ARG into Dockerfile. Otherwise use build secrets + .env file + dotenv-cli
ENV NODE_ENV=production
RUN turbo run build --filter=@repo/web

# Trimmed runner
FROM oven/bun:1.3.12-alpine AS runner
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
USER nextjs
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
