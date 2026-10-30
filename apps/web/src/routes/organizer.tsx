import { data } from "react-router";
import { fetchTournamentOrganizerRecap, settle, toDiscriminator, within } from "../api";
import { RECAP_YEAR } from "../config";
import { pageMeta, siteOrigin } from "../lib/meta";
import { formatNumber } from "../lib/stats";
import { Recap, type RecapResult } from "../pages/Recap";
import type { Route } from "./+types/organizer";

/**
 * On a page load (a visitor's first request or a link preview's crawler), the head waits up to this
 * long for the recap, for real preview tags and a 404 status. Previews give up after a few seconds.
 */
const HEAD_WAIT_MS = 2500;

export async function loader({ params, request }: Route.LoaderArgs) {
  const discriminator = toDiscriminator(params.discriminator);
  const url = `${siteOrigin(request)}/organizer/${discriminator}`;

  // The full recap streams to the page in this response; the head only waits a moment for it.
  const recap: Promise<RecapResult> = settle(fetchTournamentOrganizerRecap(discriminator)).then((result) =>
    result.status === "ok" ? { status: "ok", data: { kind: "organizer", recap: result.data } } : result,
  );
  // A navigation inside the app asks for `<path>.data` and has no head to fill in: it switches page at
  // once and shows the loading screen while the recap streams.
  const isNavigation = new URL(request.url).pathname.endsWith(".data");
  const early = isNavigation ? null : await within(recap, HEAD_WAIT_MS);

  const organizer = early?.status === "ok" && early.data.kind === "organizer" ? early.data.recap : null;
  const preview = organizer ? { name: organizer.gamerTag, totalTournaments: organizer.totalTournaments } : null;

  const notFound = early?.status === "not-found";
  return data({ url, preview, notFound, recap }, { status: notFound ? 404 : 200 });
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const { url, preview, notFound } = loaderData;
  if (notFound) {
    return [{ title: "No recap at this address · SmashRecap" }, { name: "robots", content: "noindex" }];
  }
  let description = `Every bracket this organiser ran on start.gg in ${RECAP_YEAR}, cut into a recap video. Make yours on SmashRecap.`;
  if (preview && preview.totalTournaments > 0) {
    description = `${formatNumber(preview.totalTournaments)} tournaments organised on start.gg in ${RECAP_YEAR}. Watch the recap, then make yours on SmashRecap.`;
  } else if (preview) {
    description = `No tournaments organised on start.gg in ${RECAP_YEAR} yet. Make your own recap on SmashRecap.`;
  }
  return pageMeta({
    title: preview
      ? `${preview.name}’s ${RECAP_YEAR} as an organiser on SmashRecap`
      : `A ${RECAP_YEAR} organiser recap on SmashRecap`,
    description,
    url,
    image: `${url}/og.png`,
    imageAlt: preview ? `${preview.name}’s ${RECAP_YEAR} organiser recap` : `A ${RECAP_YEAR} organiser recap`,
  });
};

export default function OrganizerRoute({ loaderData }: Route.ComponentProps) {
  return (
    <Recap kind="organizer" initialName={loaderData.preview?.name ?? null} shareUrl={loaderData.url} recap={loaderData.recap} />
  );
}
