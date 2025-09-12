# Use the latest Playwright image
FROM mcr.microsoft.com/playwright:v1.47.0-jammy

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Install Playwright browsers in a specific location
RUN npx playwright install chromium

# Find and list actual browser locations for debugging
RUN find / -name "chrome" -type f 2>/dev/null | head -10 || echo "Chrome executable not found"
RUN find / -name "chromium*" -type d 2>/dev/null | head -10 || echo "Chromium directories not found"

# Copy the rest of the application code
COPY . .

# Export the browsers path that Playwright uses by default
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Expose port
EXPOSE 4000

# Start the application
CMD ["node", "app.js"]