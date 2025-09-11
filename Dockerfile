# Use the official Playwright image which has all dependencies pre-installed
FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 4000

# Start the application
CMD ["node", "app.js"]