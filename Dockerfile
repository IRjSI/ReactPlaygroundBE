# Use Node.js slim image
FROM node:18-slim

# Install Chrome dependencies for Puppeteer
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV CACHE_BUST=2025-11-12-v1

# Copy package files
COPY package*.json ./

# Set Puppeteer to use the installed Chrome
# set it before npm ci
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Install Node.js dependencies
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Render uses PORT environment variable
ENV PORT=4000
ENV NODE_ENV=production
EXPOSE 4000

# Start both app and worker
CMD ["npm", "run", "start:web"]