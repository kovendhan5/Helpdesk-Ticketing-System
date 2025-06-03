# Frontend Dockerfile for Helpdesk Ticketing System
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Set environment variables for faster builds
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV CI=true

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies using npm ci for faster, reliable builds
RUN npm ci --only=production --no-audit --no-fund && \
    npm install --no-save react-scripts && \
    npm cache clean --force

# Copy source code and config files
COPY src/ ./src/
COPY public/ ./public/
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Build the application with optimizations
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built application
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configurations
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-main.conf /etc/nginx/nginx.conf

# Set ownership for nginx files and create writable temp directory
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    mkdir -p /tmp/nginx && \
    chmod 777 /tmp/nginx && \
    mkdir -p /var/log/nginx && \
    chmod 755 /var/log/nginx && \
    touch /tmp/nginx/nginx.pid && \
    chmod 666 /tmp/nginx/nginx.pid

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health || exit 1

# Start nginx with explicit configuration
CMD ["nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]
