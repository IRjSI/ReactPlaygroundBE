# Use the latest Playwright image
FROM mcr.microsoft.com/playwright:v1.47.0-jammy

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Explicitly install and verify Playwright browsers
RUN npx playwright install chromium
RUN npx playwright install-deps chromium

# Verify browser installation
RUN ls -la /ms-playwright/chromium-*/ || echo "Browsers not found in expected location"

# Copy the rest of the application code
COPY . .

# Set environment variables to help Playwright find browsers
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=false

# Expose port
EXPOSE 4000

# Start the application
CMD ["node", "app.js"]