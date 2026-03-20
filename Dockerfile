FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=5 \
  CMD curl -f http://localhost:8000/health || exit 1
CMD ["sh", "-c", "node scripts/wait-for-db.js && npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all && npm run start"]