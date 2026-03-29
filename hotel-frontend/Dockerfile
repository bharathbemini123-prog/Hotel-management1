# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
# Custom nginx config to handle React Router (if needed, but default works for many)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
