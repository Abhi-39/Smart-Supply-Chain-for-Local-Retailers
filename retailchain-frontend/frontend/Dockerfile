# frontend/Dockerfile (use Node 20 so Vite works)
FROM node:20-alpine AS build
WORKDIR /app

# copy package files, install dependencies
COPY package*.json ./
RUN npm ci --silent

# copy remaining source and build
COPY . .
RUN npm run build

# serve with nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
