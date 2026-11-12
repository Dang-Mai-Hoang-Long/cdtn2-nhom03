# Image dùng chung cho API (backend) và giao diện (Vite); docker-compose chọn lệnh chạy cho từng dịch vụ.
# Bản Debian (glibc) vì lockfile của frontend có sẵn gói native của rolldown cho Linux gnu.
FROM node:22-bookworm-slim

WORKDIR /app
RUN chown node:node /app
USER node

# Cài thư viện trước để Docker dùng lại lớp này khi chỉ mã nguồn thay đổi.
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci
RUN mkdir frontend
COPY --chown=node:node frontend/package.json frontend/package-lock.json frontend/
RUN npm --prefix frontend ci

COPY --chown=node:node . .

# Đặt sau bước cài để vẫn cài đủ thư viện phát triển (test, concurrently).
ENV NODE_ENV=development
EXPOSE 3000 5173

CMD ["npm", "start"]
