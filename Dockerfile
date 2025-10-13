# Stage 1: Build
FROM node:20.19 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY index.html .
COPY src ./src
COPY public ./public
COPY vite.config.js .

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
