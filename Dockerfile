# Use Node.js 20 Alpine as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files from root
COPY package*.json ./

# Copy work-types.json from root (needed for precast-api)
COPY work-types.json ./

# Copy precast-api specific files
COPY precast-api/package*.json ./precast-api/
COPY precast-api/tsconfig.json ./precast-api/
COPY precast-api/src ./precast-api/src

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Install precast-api dependencies (including TypeScript)
RUN cd precast-api && npm install

# Build TypeScript
RUN cd precast-api && npx tsc

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S precast -u 1001

# Create logs directory
RUN mkdir -p logs

# Change ownership of app directory
RUN chown -R precast:nodejs /app
USER precast

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
