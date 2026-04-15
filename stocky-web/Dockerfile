FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --registry=https://registry.npmmirror.com
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist/stocky-web /usr/share/nginx/html
EXPOSE 80
