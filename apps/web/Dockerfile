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
RUN bun install

# Build with full source
FROM installer AS builder
COPY --from=pruner /app/out/full/ .
ARG DB_URL BETTER_AUTH_SECRET BETTER_AUTH_URL GITHUB_CLIENT_ID GITHUB_CLIENT_SECRET NEXT_PUBLIC_WS_URL NEXT_PUBLIC_WS_SECRET
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
