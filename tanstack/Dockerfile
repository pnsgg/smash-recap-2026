FROM oven/bun:1.3.14-debian AS base

FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun ci

FROM base AS production-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
USER bun
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/package.json /app/package.json
EXPOSE 3000
CMD [ "bun", "start" ]
