# --- STAGE 1: Base Setup & Core Dependencies ---
FROM node:18-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

# --- STAGE 2: Install Dependencies ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy lock and configuration files to maximize build cache performance
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# --- STAGE 3: Build the Application ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables required *during* Next.js build compilation
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_GOOGLE_REDIRECT_URI
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_REDIRECT_URI=$NEXT_PUBLIC_GOOGLE_REDIRECT_URI

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# --- STAGE 4: Production Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Establish a non-root system user for environment hardening
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Safely carry forward structural build assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Next.js standalone output bundles its own minimal Node backend launcher
CMD ["node", "server.js"]
