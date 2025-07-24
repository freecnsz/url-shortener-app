# ---------- STAGE 1: Build ----------
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies for build
COPY package*.json ./
RUN npm ci

# Copy source code and Prisma schema
COPY prisma ./prisma
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build


# ---------- STAGE 2: Production ----------
FROM node:22-alpine AS production

WORKDIR /app

# Install required system tools
RUN apk add --no-cache postgresql-client bash

# Create non-root user
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# Copy only necessary files
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy and prepare the entrypoint script
COPY --from=build /app/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Ensure logs folder exists
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

# Switch to non-root user
USER nodejs

# Expose app port
EXPOSE 3000

# Healthcheck to ensure container is up and responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --spider -q http://localhost:${PORT:-3000}/health || exit 1

# Entrypoint and default command
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/app.js"]
