import { fetchTournamentOrganizerSummary, toDiscriminator } from "../api";
import { RECAP_YEAR } from "../config";
import { formatNumber } from "../lib/stats";
import { cardResponse } from "../og/card.server";
import type { Route } from "./+types/og.organizer";

/** Previews fetch the image after the page, so it can wait a little longer for a fresh recap. */
const SUMMARY_TIMEOUT_MS = 6000;

export async function loader({ params }: Route.LoaderArgs) {
  const result = await fetchTournamentOrganizerSummary(toDiscriminator(params.discriminator), SUMMARY_TIMEOUT_MS);
  const kicker = `Organiser recap ${RECAP_YEAR}`;

  if (result.status === "not-found") {
    return cardResponse({ kicker, title: "No signal", subtitle: "There is no start.gg account at this address." }, "not-found");
  }
  if (result.status === "unavailable") {
    return cardResponse(
      { kicker, title: `A ${RECAP_YEAR} of brackets, replayed`, subtitle: "Every tournament run on start.gg this year, cut into one video." },
      "pending",
    );
  }

  const summary = result.data;
  if (summary.totalTournaments === 0) {
    return cardResponse({ kicker, title: summary.gamerTag, subtitle: `No tournaments organised on start.gg in ${RECAP_YEAR} yet.` }, "final");
  }
  return cardResponse(
    {
      kicker,
      title: summary.gamerTag,
      figure: {
        value: formatNumber(summary.totalTournaments),
        label: summary.totalTournaments === 1 ? "tournament run" : "tournaments run",
        detail: `on start.gg in ${RECAP_YEAR}`,
      },
    },
    "final",
  );
}
