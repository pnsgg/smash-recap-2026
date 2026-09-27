# Build context is the monorepo root:
#   docker build -f apps/api/Dockerfile -t api .

FROM oven/bun:1 AS build

WORKDIR /app

# Cache dependencies (workspace-aware install needs the root manifests)
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

COPY --from=build /app/apps/api/server server

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["./server"]
