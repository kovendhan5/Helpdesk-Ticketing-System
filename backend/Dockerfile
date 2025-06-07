# Backend Dockerfile for Helpdesk Ticketing System
# Multi-stage build for production optimization
FROM node:20-alpine AS base

# Install common dependencies
RUN apk add --no-cache \
  wget \
  curl \
  && addgroup -g 1001 -S nodejs \
  && adduser -S nodejs -u 1001

WORKDIR /app

# Development stage
FROM base AS development
COPY package*.json ./
RUN npm ci
COPY . .
USER nodejs
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Production dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && \
  npm cache clean --force

# Production stage
FROM base AS production
WORKDIR /app

# Copy production dependencies
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy source code (exclude development files)
COPY --chown=nodejs:nodejs src/ ./src/
COPY --chown=nodejs:nodejs package*.json ./

# Create logs directory
RUN mkdir -p /app/logs && chown nodejs:nodejs /app/logs

# Install wget for health checks
RUN apk add --no-cache wget

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "src/index.js"]
