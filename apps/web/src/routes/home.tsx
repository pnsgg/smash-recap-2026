import { fetchPlayerRecap, fetchStats, settle } from "../api";
import { RECAP_YEAR } from "../config";
import { FEATURED_PLAYERS } from "../data/featured";
import { pageMeta, siteOrigin } from "../lib/meta";
import { Home } from "../pages/Home";
import type { Route } from "./+types/home";

export function loader({ request }: Route.LoaderArgs) {
  // Not awaited: every recap streams into the page as it arrives (instantly from the API's cache).
  const featured = FEATURED_PLAYERS.map((p) => settle(fetchPlayerRecap(p.discriminator)));
  // Picked here, not in the browser, so the server and the hydrated page show the same player.
  const preview = Math.floor(Math.random() * FEATURED_PLAYERS.length);
  return { origin: siteOrigin(request), featured, preview, stats: settle(fetchStats()) };
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
  pageMeta({
    title: `SmashRecap: your ${RECAP_YEAR} start.gg season as a video`,
    description: `SmashRecap reads every set you played or bracket you ran on start.gg in ${RECAP_YEAR} and turns it into your own recap video.`,
    url: `${loaderData.origin}/`,
    image: `${loaderData.origin}/og.png`,
    imageAlt: `SmashRecap: replay your ${RECAP_YEAR} season`,
  });

export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  const { featured, preview, stats } = loaderData;
  return (
    <Home featured={featured} preview={{ player: FEATURED_PLAYERS[preview]!, recap: featured[preview]! }} stats={stats} />
  );
}
