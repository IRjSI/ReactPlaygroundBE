# Use the official Playwright image (this should have browsers pre-installed)
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app code  
COPY . .

# Don't set custom browser paths - let Playwright use its defaults
# The official image should have browsers in the right locations

EXPOSE 4000
CMD ["node", "app.js"]