# Stage 1: Build Angular app
FROM node:20 as build-step
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration production

# Stage 2: Serve app with nginx
FROM nginx:alpine
COPY --from=build-step /app/dist/frontend /usr/share/nginx/html

# Add nginx config to support Angular routing
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]