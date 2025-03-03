FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Create data directory with proper permissions
RUN mkdir -p data/servers && \
    chown -R node:node data

# Create non-root user
USER node

# Set proper NODE_ENV
ENV NODE_ENV=production

# Add tini for proper signal handling
ENV TINI_VERSION v0.19.0
ADD --chmod=755 https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
ENTRYPOINT ["/tini", "--"]

# Run the application
CMD ["node", "src/index.js"]
