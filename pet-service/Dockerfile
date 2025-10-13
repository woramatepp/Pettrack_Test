FROM node:18-alpine
WORKDIR /app

# คัดลอกไฟล์ที่จำเป็นสำหรับ user-service และ pet-service
COPY user-service/package*.json ./
RUN npm install

COPY user-service/ ./user-service
COPY pet-service/ ./pet-service

# เปลี่ยน working directory ไปที่ user-service เพื่อ start server
WORKDIR /app/user-service
EXPOSE 3000
CMD ["node", "server.js"]