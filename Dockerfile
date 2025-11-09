# Use official Node.js 22 LTS image (latest stable)
FROM node:22

# Set working directory
WORKDIR /usr/src/app

# Copy dependency files first (better caching)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the rest of your code
COPY . .

# Set environment variable for Cloud Run port
ENV PORT=8080

# Expose the port (for Cloud Run health checks)
EXPOSE 8080

# Start your bot
CMD [ "npm", "start" ]
