import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("og.png", "routes/og.site.ts"),
  route("search/players", "routes/search.players.ts"),
  route("player/:discriminator", "routes/player.tsx"),
  route("player/:discriminator/og.png", "routes/og.player.ts"),
  route("organizer/:discriminator", "routes/organizer.tsx"),
  route("organizer/:discriminator/og.png", "routes/og.organizer.ts"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
