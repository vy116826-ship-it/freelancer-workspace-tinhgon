# --- STAGE 1: Build source code bằng Node ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- STAGE 2: Chạy Production bằng Nginx siêu nhẹ ---
FROM nginx:alpine
# Copy toàn bộ file tĩnh đã build từ thư mục dist của Stage 1 vào thư mục gốc của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for SPA routing
COPY default.conf /etc/nginx/conf.d/default.conf

# Mở cổng 80 mặc định của Nginx bên trong container
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
