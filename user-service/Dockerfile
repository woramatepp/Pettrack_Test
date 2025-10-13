FROM node:18-alpine
WORKDIR /app

COPY user-service/package*.json ./
RUN npm install

COPY user-service/ ./user-service
COPY pet-service/ ./pet-service

WORKDIR /app/user-service
EXPOSE 3000
CMD ["node", "server.js"]
