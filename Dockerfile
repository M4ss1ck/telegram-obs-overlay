FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Expose the port specified in the .env file (default is 3000)
EXPOSE 3000

# Start the application
CMD ["node", "server.js"] 