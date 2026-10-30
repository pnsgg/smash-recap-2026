import { data, redirect } from "react-router";
import { fetchPlayerRecap, gameFromUrl, gameQuery, recapPath, settle, toDiscriminator, within } from "../api";
import { RECAP_YEAR } from "../config";
import { pageMeta, siteOrigin } from "../lib/meta";
import { displayName, formatNumber } from "../lib/stats";
import { Recap, type RecapResult } from "../pages/Recap";
import type { Route } from "./+types/player";

/**
 * On a page load (a visitor's first request or a link preview's crawler), the head waits up to this
 * long for the recap, for real preview tags and a 404 status. Previews give up after a few seconds.
 */
const HEAD_WAIT_MS = 2500;

export async function loader({ params, request }: Route.LoaderArgs) {
  const discriminator = toDiscriminator(params.discriminator);
  const game = gameFromUrl(new URL(request.url));
  // A game SmashRecap doesn't cover: the player's recap for the default game instead.
  if (!game) throw redirect(recapPath("player", discriminator));
  const url = `${siteOrigin(request)}${recapPath("player", discriminator, game)}`;
  const image = `${siteOrigin(request)}/player/${discriminator}/og.png${gameQuery(game)}`;

  // The full recap streams to the page in this response; the head only waits a moment for it.
  const recap: Promise<RecapResult> = settle(fetchPlayerRecap(discriminator, game)).then((result) =>
    result.status === "ok" ? { status: "ok", data: { kind: "player", recap: result.data, game } } : result,
  );
  // A navigation inside the app asks for `<path>.data` and has no head to fill in: it switches page at
  // once and shows the loading screen while the recap streams.
  const isNavigation = new URL(request.url).pathname.endsWith(".data");
  const early = isNavigation ? null : await within(recap, HEAD_WAIT_MS);

  const player = early?.status === "ok" && early.data.kind === "player" ? early.data.recap : null;
  const preview = player
    ? {
        name: displayName(player.prefix, player.gamerTag),
        totalTournaments: player.totalTournaments,
        totalSets: player.totalSets,
      }
    : null;

  const notFound = early?.status === "not-found";
  return data({ url, image, game, preview, notFound, recap }, { status: notFound ? 404 : 200 });
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const { url, image, game, preview, notFound } = loaderData;
  if (notFound) {
    return [{ title: "No recap at this address · SmashRecap" }, { name: "robots", content: "noindex" }];
  }
  let description = `Every ${game.short} set this player fought on start.gg in ${RECAP_YEAR}, cut into a recap video. Make yours on SmashRecap.`;
  if (preview && preview.totalTournaments > 0) {
    description = `${formatNumber(preview.totalTournaments)} tournaments and ${formatNumber(preview.totalSets)} ${game.short} sets on start.gg in ${RECAP_YEAR}. Watch the recap, then make yours on SmashRecap.`;
  } else if (preview) {
    description = `No ${game.name} sets on start.gg in ${RECAP_YEAR} yet. Make your own recap on SmashRecap.`;
  }
  return pageMeta({
    title: preview
      ? `${preview.name}’s ${RECAP_YEAR} ${game.short} season on SmashRecap`
      : `A ${RECAP_YEAR} ${game.short} player recap on SmashRecap`,
    description,
    url,
    image,
    imageAlt: preview ? `${preview.name}’s ${RECAP_YEAR} ${game.short} recap` : `A ${RECAP_YEAR} ${game.short} player recap`,
  });
};

export default function PlayerRoute({ loaderData }: Route.ComponentProps) {
  return (
    <Recap
      kind="player"
      game={loaderData.game}
      initialName={loaderData.preview?.name ?? null}
      shareUrl={loaderData.url}
      recap={loaderData.recap}
    />
  );
}
