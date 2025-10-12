# Stage 1: Build frontend
FROM node:20.19 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY  . .

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
