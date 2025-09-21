# Backend Dockerfile
FROM node:18-alpine

# Install required dependencies for Prisma
RUN apk update && apk add --no-cache \
    openssl \
    ca-certificates \
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy prisma schema first for generation
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY src ./src/

# Create uploads directory
RUN mkdir -p uploads/audio

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node src/scripts/healthcheck.js || exit 1

# Start the application
CMD ["npm", "start"]