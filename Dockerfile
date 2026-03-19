FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Set environment
ENV NODE_ENV=docker

EXPOSE 8000

# Health check command for Docker
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=5 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run DB wait, migrations, seed (optional), then start server
CMD ["sh", "-c", "node scripts/wait-for-db.js && npx sequelize-cli db:migrate && [ \"$SKIP_SEED\" != \"true\" ] && npx sequelize-cli db:seed:all && npm run start"]