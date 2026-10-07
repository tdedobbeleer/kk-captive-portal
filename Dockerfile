# --- STAGE 1: Official pnpm Base Image with Custom Node Version ---
FROM ghcr.io/pnpm/pnpm:12 AS base
# Pin your Node version using pnpm's official runtime management
RUN pnpm runtime set node 24 -g

# --- STAGE 2: Install Dependencies using BuildKit Cache Mounts ---
FROM base AS deps
COPY . /app
WORKDIR /app
# Utilize the official BuildKit cache mount syntax to share the pnpm store across builds safely
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# --- STAGE 3: Build the Application ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# --- STAGE 4: Production Runner (official Node 24 Alpine) ---
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Establish a non-root system user for environment security
# NOTE: Alpine uses BusyBox addgroup/adduser (groupadd/useradd do not exist here)
RUN addgroup -S --gid 1001 nodejs && \
    adduser -S --uid 1001 -G nodejs --home /app -H -s /sbin/nologin nextjs && \
    chown -R nextjs:nodejs /app

# Safely copy forward minimal compiled structural assets from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Next.js standalone engine executes via its own optimized server wrapper
CMD ["node", "server.js"]