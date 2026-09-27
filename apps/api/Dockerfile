# Build context is the monorepo root:
#   docker build -f apps/api/Dockerfile -t api .

FROM oven/bun:1 AS frontend-build

WORKDIR /app

# Cache dependencies (workspace-aware install needs the root manifests, plus
# every workspace apps/web pulls in source from via path aliases: @shared ->
# packages/shared/src, @video -> apps/remotion/src)
COPY package.json bun.lock ./
COPY apps/web/package.json apps/web/package.json
COPY apps/remotion/package.json apps/remotion/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN bun install --frozen-lockfile

COPY tsconfig.base.json ./tsconfig.base.json
COPY apps/web ./apps/web
COPY apps/remotion ./apps/remotion
COPY packages/shared ./packages/shared
# packages/shared/src/fixtures imports id-branding helpers via the @api/*
# alias, so apps/api's source has to be present too, even though it's not a
# declared workspace dependency of apps/web
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
COPY --from=frontend-build /app/apps/web/dist public

ENV NODE_ENV=production
ENV PORT=3001
ENV STATIC_DIR=/app/public

EXPOSE 3001

CMD ["./server"]
