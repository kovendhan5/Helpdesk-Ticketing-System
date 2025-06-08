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
# Enhanced npm configuration for maximum reliability
RUN npm config set fetch-retry-mintimeout 20000 && \
  npm config set fetch-retry-maxtimeout 120000 && \
  npm config set fetch-retries 5 && \
  npm config set registry https://registry.npmjs.org/ && \
  npm config set maxsockets 10 && \
  npm config set timeout 300000 && \
  (npm ci --no-audit --no-fund --verbose || \
  (echo "Retrying with alternative registry..." && \
  npm config set registry https://registry.yarnpkg.com && \
  npm ci --no-audit --no-fund --verbose)) && \
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

# Install wget for health checks (replacing curl)
RUN apk add --no-cache wget

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

# Start nginx
CMD ["nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]
