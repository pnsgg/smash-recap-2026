import { searchPlayers } from "../api";
import type { Route } from "./+types/search.players";

/**
 * Live player search for the search console (`useFetcher`). Asks the API from the server, so the
 * browser only talks to this site. Failures come back as data, not as a thrown error, which would
 * replace the page with an error boundary.
 */
export async function loader({ url }: Route.LoaderArgs) {
  const gamertag = url.searchParams.get("gamertag")?.trim() ?? "";
  if (gamertag.length < 2) return { gamertag, players: [], failed: false };
  try {
    return { gamertag, players: await searchPlayers(gamertag, AbortSignal.timeout(15_000)), failed: false };
  } catch {
    return { gamertag, players: [], failed: true };
  }
}
