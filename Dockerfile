# Use Ubuntu base image and install Playwright manually
FROM ubuntu:22.04

# Install Node.js and basic dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright system dependencies
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libgbm1 \
    libasound2 \
    libxrandr2 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxss1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies (this installs Playwright)
RUN npm ci --only=production

# Install Playwright browsers with explicit path
ENV PLAYWRIGHT_BROWSERS_PATH=/app/browsers
RUN npx playwright install chromium
RUN npx playwright install-deps chromium

# Verify installation and show paths
RUN ls -la /app/browsers/ || echo "Browsers not in /app/browsers"
RUN find /root -name "*chromium*" -type d 2>/dev/null | head -5 || echo "No chromium dirs in /root"
RUN which chrome || echo "Chrome not in PATH"

# Copy application code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/app/browsers

# Expose port
EXPOSE 4000

# Start the application
CMD ["node", "app.js"]