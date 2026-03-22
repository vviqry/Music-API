FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Ensure upload directory exists
RUN mkdir -p public/music

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "index.js"]
