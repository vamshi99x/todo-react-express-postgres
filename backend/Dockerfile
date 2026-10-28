
FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

RUN pnpm install --filter backend... --frozen-lockfile

COPY backend/ ./backend/

RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend build

WORKDIR /app/backend

EXPOSE 8081

CMD ["node", "dist/index.js"]

