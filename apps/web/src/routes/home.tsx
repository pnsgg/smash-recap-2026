import { fetchPlayerRecap, fetchTournamentOrganizerRecap, settle } from "../api";
import { RECAP_YEAR } from "../config";
import { FEATURED_PLAYERS, MENU_EXAMPLE_ORGANIZER, MENU_EXAMPLE_PLAYER } from "../data/featured";
import { pageMeta, siteOrigin } from "../lib/meta";
import { Home } from "../pages/Home";
import type { Route } from "./+types/home";

export function loader({ request }: Route.LoaderArgs) {
  // Not awaited: every recap streams into the page as it arrives (instantly from the API's cache).
  const players = new Map(FEATURED_PLAYERS.map((p) => [p.discriminator, settle(fetchPlayerRecap(p.discriminator))]));
  return {
    origin: siteOrigin(request),
    featured: FEATURED_PLAYERS.map((p) => players.get(p.discriminator)!),
    menu: {
      player: players.get(MENU_EXAMPLE_PLAYER.discriminator)!,
      organizer: settle(fetchTournamentOrganizerRecap(MENU_EXAMPLE_ORGANIZER.discriminator)),
    },
  };
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
  pageMeta({
    title: `SmashRecap: your ${RECAP_YEAR} start.gg season as a video`,
    description: `SmashRecap reads every set you played or bracket you ran on start.gg in ${RECAP_YEAR} and turns it into your own recap video.`,
    url: `${loaderData.origin}/`,
    image: `${loaderData.origin}/og.png`,
    imageAlt: `SmashRecap: replay your ${RECAP_YEAR} season`,
  });

export const links: Route.LinksFunction = () => [
  { rel: "preload", as: "image", href: "/media/hall-crt.jpg", fetchPriority: "high" },
];

export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  return <Home featured={loaderData.featured} menu={loaderData.menu} />;
}
