# Frontend Dockerfile for Helpdesk Ticketing System
# Multi-stage build for production optimization
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Development stage
FROM base AS development
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

# Build stage
FROM base AS build

# Set build environment variables
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV CI=true
ENV PUBLIC_URL=/

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies including devDependencies for build
RUN npm ci --no-audit --no-fund && \
  npm cache clean --force

# Copy source code and config files
COPY src/ ./src/
COPY public/ ./public/
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Build the application with optimizations
RUN npm run build && \
  # Remove unnecessary files from build
  find ./build -name "*.map" -delete

# Production stage with nginx
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configurations
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-main.conf /etc/nginx/nginx.conf

# Create health check endpoint
RUN echo '<!DOCTYPE html><html><body><h1>OK</h1></body></html>' > /usr/share/nginx/html/health

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
  chmod -R 755 /usr/share/nginx/html && \
  mkdir -p /tmp/nginx /var/cache/nginx && \
  chown -R nginx:nginx /tmp/nginx /var/cache/nginx && \
  chmod 755 /var/log/nginx

# Create non-root user for security
USER nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

# Start nginx
CMD ["nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]
