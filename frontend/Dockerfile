# Multi-stage production Dockerfile for Next.js frontend
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
# Use npm install since lockfile might be out of sync
RUN npm install && npm cache clean --force
COPY . .
# Build the Next.js application
RUN npm run build

# Production stage
FROM node:20-bookworm-slim
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copy built files and dependencies from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check (Next.js doesn't have built-in health endpoint, so check homepage)
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Start the production server
CMD ["npm", "start"]
