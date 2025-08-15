# Build static frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* tsconfig.json vite.config.ts ./
COPY index.html ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile
COPY src ./src
RUN pnpm build

# Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
