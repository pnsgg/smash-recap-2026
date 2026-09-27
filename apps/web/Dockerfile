# Build context is the monorepo root:
#   docker build -f apps/web/Dockerfile -t web .

FROM oven/bun:1 AS build

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

ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app/apps/web
RUN bun run build

FROM oven/bun:1-distroless

WORKDIR /app

COPY apps/web/serve.ts ./serve.ts
COPY --from=build /app/apps/web/dist ./dist

ENV PORT=80
EXPOSE 80

CMD ["run", "serve.ts"]
