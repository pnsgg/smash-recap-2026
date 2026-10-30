import { createApiClient, DEFAULT_GAME, findGame, type Game } from "@shared";
import { API_URL } from "./config";

const client = createApiClient(API_URL);

export type RecapKind = "player" | "organizer";

/** start.gg user slugs look like `user/541f04fd`; the part after the slash is the discriminator. */
export const toUserSlug = (discriminator: string) => `user/${discriminator}`;
export const toDiscriminator = (slug: string) => slug.replace(/^user\//, "");

/** `?videogameId=1` for a player recap of any game but the default one, which keeps the bare address. */
export const gameQuery = (game: Game = DEFAULT_GAME) => (game.id === DEFAULT_GAME.id ? "" : `?videogameId=${game.id}`);

/** A recap's page. Player recaps are per game; organiser recaps count every game, so they take none. */
export const recapPath = (kind: RecapKind, discriminator: string, game?: Game) =>
  `/${kind}/${discriminator}${kind === "player" ? gameQuery(game) : ""}`;

/**
 * The game a player recap address asks for: the default one with no `videogameId`, null for a
 * game SmashRecap doesn't cover.
 */
export const gameFromUrl = (url: URL): Game | null => {
  const id = url.searchParams.get("videogameId");
  return id === null ? DEFAULT_GAME : (findGame(id) ?? null);
};

export class RecapNotFoundError extends Error {
  constructor(public readonly discriminator: string) {
    super(`No start.gg account found for user/${discriminator}`);
    this.name = "RecapNotFoundError";
  }
}

export async function fetchPlayerRecap(discriminator: string, game: Game = DEFAULT_GAME) {
  const { data, error } = await client.api.v1
    .players({ slug: toUserSlug(discriminator) })
    .recap.get({ query: { videogameId: game.id } });

  if (error?.status === 404) throw new RecapNotFoundError(discriminator);
  if (error) throw new Error(`Failed to fetch player recap: ${error.status}`);
  return data;
}

export async function fetchTournamentOrganizerRecap(discriminator: string) {
  const { data, error } = await client.api.v1["tournament-organizers"]({ slug: toUserSlug(discriminator) }).recap.get();

  if (error?.status === 404) throw new RecapNotFoundError(discriminator);
  if (error) throw new Error(`Failed to fetch tournament organizer recap: ${error.status}`);
  return data;
}

export async function searchPlayers(gamertag: string, signal?: AbortSignal) {
  const { data, error } = await client.api.v1.players.search.get({ query: { gamertag }, fetch: { signal } });

  if (error) throw new Error(`Player search failed: ${error.status}`);
  return data;
}

export type PlayerSearchResult = Awaited<ReturnType<typeof searchPlayers>>[number];

/**
 * The outcome of asking for recap data on the server. Resolved, never thrown: errors thrown in
 * streamed loader data are sanitised in production, so the page could not tell them apart.
 */
export type Settled<T> = { status: "ok"; data: T } | { status: "not-found" } | { status: "unavailable" };

export async function settle<T>(promise: Promise<T>): Promise<Settled<T>> {
  try {
    return { status: "ok", data: await promise };
  } catch (error) {
    return error instanceof RecapNotFoundError ? { status: "not-found" } : { status: "unavailable" };
  }
}

/** Waits for a settled result at most `timeoutMs`; null when it is still on its way. */
export const within = <T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> =>
  Promise.race([promise, new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs))]);

/** The name and headline numbers for link previews, giving up after `timeoutMs`. */
export async function fetchPlayerSummary(discriminator: string, timeoutMs: number, game: Game = DEFAULT_GAME) {
  return settle(
    (async () => {
      const { data, error } = await client.api.v1
        .players({ slug: toUserSlug(discriminator) })
        .summary.get({ query: { videogameId: game.id }, fetch: { signal: AbortSignal.timeout(timeoutMs) } });
      if (error?.status === 404) throw new RecapNotFoundError(discriminator);
      if (error || !data) throw new Error(`Failed to fetch player summary: ${error?.status}`);
      return data;
    })(),
  );
}

export async function fetchTournamentOrganizerSummary(discriminator: string, timeoutMs: number) {
  return settle(
    (async () => {
      const { data, error } = await client.api.v1["tournament-organizers"]({ slug: toUserSlug(discriminator) })
        .summary.get({ fetch: { signal: AbortSignal.timeout(timeoutMs) } });
      if (error?.status === 404) throw new RecapNotFoundError(discriminator);
      if (error || !data) throw new Error(`Failed to fetch tournament organizer summary: ${error?.status}`);
      return data;
    })(),
  );
}
