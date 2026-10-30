import { fetchPlayerSummary, toDiscriminator } from "../api";
import { RECAP_YEAR } from "../config";
import { displayName, formatNumber } from "../lib/stats";
import { cardResponse } from "../og/card.server";
import type { Route } from "./+types/og.player";

/** Previews fetch the image after the page, so it can wait a little longer for a fresh recap. */
const SUMMARY_TIMEOUT_MS = 6000;

export async function loader({ params, request }: Route.LoaderArgs) {
  const videogameId = new URL(request.url).searchParams.get("videogameId") ?? undefined;
  const result = await fetchPlayerSummary(toDiscriminator(params.discriminator), SUMMARY_TIMEOUT_MS, videogameId);
  const kicker = `Player recap ${RECAP_YEAR}`;

  if (result.status === "not-found") {
    return cardResponse({ kicker, title: "No signal", subtitle: "There is no start.gg account at this address." }, "not-found");
  }
  if (result.status === "unavailable") {
    return cardResponse(
      { kicker, title: `A ${RECAP_YEAR} season, replayed`, subtitle: "Every set fought on start.gg this year, cut into one video." },
      "pending",
    );
  }

  const summary = result.data;
  const title = displayName(summary.prefix, summary.gamerTag);
  if (summary.totalSets === 0) {
    return cardResponse({ kicker, title, subtitle: `No Super Smash Bros. Ultimate sets on start.gg in ${RECAP_YEAR} yet.` }, "final");
  }
  return cardResponse(
    {
      kicker,
      title,
      figure: {
        value: formatNumber(summary.totalSets),
        label: summary.totalSets === 1 ? "set played" : "sets played",
        detail: `across ${formatNumber(summary.totalTournaments)} start.gg tournaments in ${RECAP_YEAR}`,
      },
    },
    "final",
  );
}
