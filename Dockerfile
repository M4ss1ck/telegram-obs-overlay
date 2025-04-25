FROM node:18-alpine

# Create app directory
WORKDIR /app

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci
RUN npm install -g nodemon

# Copy app source
COPY --chown=appuser:appgroup . .

# Expose the port specified in the .env file (default is 3000)
EXPOSE 3000

# Switch to non-root user
USER appuser

# Set the default command
CMD ["node", "server.js"] 