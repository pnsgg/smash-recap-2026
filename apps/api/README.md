# api

Elysia/Bun HTTP API serving yearly recap stats for Smash players and tournament organizers, sourced from start.gg.

## Development

```bash
bun run dev
```

Serves `/api/v1/players/search`, `/api/v1/players/:slug/recap`, `/api/v1/tournament-organizers/:slug/recap`, plus OpenAPI docs at `/openapi`.

## Testing

```bash
bun test
bun run typecheck
```

## Build

```bash
bun run build        # compiles a standalone binary to ./server

# from the repo root — the build needs the monorepo's package.json/bun.lock:
docker build -f apps/api/Dockerfile -t api .
```

See `#recap`/`#search`/`#shared` in `package.json`'s `imports` field for this package's internal module aliases, and the root `tsconfig.base.json` for the `@api`/`@shared` cross-package aliases consumed by `packages/shared`.
