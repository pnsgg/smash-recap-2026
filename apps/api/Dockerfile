FROM oven/bun:1 AS frontend-build

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/web/package.json apps/web/package.json
COPY apps/remotion/package.json apps/remotion/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN bun install --frozen-lockfile

COPY tsconfig.base.json ./tsconfig.base.json
COPY apps/web ./apps/web
COPY apps/remotion ./apps/remotion
COPY packages/shared ./packages/shared
COPY apps/api/src ./apps/api/src

WORKDIR /app/apps/web
RUN bun run build

FROM oven/bun:1 AS backend-build

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
RUN bun install --frozen-lockfile

COPY apps/api ./apps/api

ENV NODE_ENV=production
WORKDIR /app/apps/api

RUN bun build \
  --compile \
  --minify-whitespace \
  --minify-syntax \
  --target bun \
  --outfile server \
  src/index.ts

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=backend-build /app/apps/api/server server
COPY --from=frontend-build /app/apps/web/build web

ENV NODE_ENV=production
ENV PORT=3001
ENV WEB_BUILD_DIR=/app/web

EXPOSE 3001

CMD ["./server"]
