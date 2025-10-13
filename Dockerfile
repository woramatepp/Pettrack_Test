# Stage 1: Build Vue app
FROM node:20.19 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY index.html .
COPY src ./src
COPY public ./public
COPY vite.config.js .

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
