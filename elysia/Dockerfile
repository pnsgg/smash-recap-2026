FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY tsconfig.json ./
COPY src ./src
ENV NODE_ENV=production
RUN bun build \
  --compile \
  --minify-whitespace \
  --minify-syntax \
  --target bun \
  --outfile server \
  src/index.ts

FROM gcr.io/distroless/base
WORKDIR /app
COPY --from=build /app/server server
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001
CMD ["./server"]
