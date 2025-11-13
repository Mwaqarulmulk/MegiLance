# Multi-stage production Dockerfile for Next.js frontend
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
# Use npm install with --legacy-peer-deps to handle eslint version conflicts
RUN npm install --legacy-peer-deps && npm cache clean --force
COPY . .
# Build the Next.js application
RUN npm run build

# Production stage
FROM node:20-bookworm-slim
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copy all necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Use the node user from the base image
USER node

ENV NODE_ENV=production
EXPOSE 3000

# Health check (Next.js doesn't have built-in health endpoint, so check homepage)
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/ || exit 1

# Start the production server (respects PORT env var)
CMD ["npm", "start"]
