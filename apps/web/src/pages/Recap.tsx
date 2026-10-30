import type { PlayerRecapProps, TournamentOrganizerRecapProps } from "@shared";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Await, Link, useParams, useRevalidator } from "react-router";
import { recapPath, toDiscriminator, type RecapKind, type Settled } from "../api";
import { PixelNumber } from "../components/PixelNumber";
import { PlayerLoading } from "../components/PlayerLoading";
import { RecapActions } from "../components/RecapActions";
import { SearchConsole } from "../components/SearchConsole";
import { SettingsToggles } from "../components/SettingsToggles";
import { Static } from "../components/Static";
import { Wordmark } from "../components/Wordmark";
import { RECAP_YEAR } from "../config";
import { displayName, formatNumber, organizerStatGroups, playerStatGroups, playerSummary, type StatLine } from "../lib/stats";
import "./Recap.css";

export type RecapData =
  | { kind: "player"; recap: PlayerRecapProps }
  | { kind: "organizer"; recap: TournamentOrganizerRecapProps };

/** What the route's loader streams: the recap, or why there is none. */
export type RecapResult = Settled<RecapData>;

const KIND_LABEL: Record<RecapKind, string> = { player: "Player recap", organizer: "Organiser recap" };

const RecapPlayer = lazy(() => import("../components/RecapPlayer"));

type Props = {
  kind: RecapKind;
  /** The account's name, when the server had it before sending the page. */
  initialName?: string | null;
  /** The recap's public address, used for sharing and printed on the downloadable image. */
  shareUrl: string;
  /** Streamed by the route's loader in the same response as the page. */
  recap: Promise<RecapResult>;
};

export function Recap({ recap, ...screen }: Props) {
  return (
    <Suspense fallback={<RecapScreen {...screen} result={null} />}>
      <Await resolve={recap}>{(result) => <RecapScreen {...screen} result={result} />}</Await>
    </Suspense>
  );
}

type ScreenProps = Omit<Props, "recap"> & {
  /** null while the recap is still on its way. */
  result: RecapResult | null;
};

function RecapScreen({ kind, initialName = null, shareUrl, result }: ScreenProps) {
  const discriminator = toDiscriminator(useParams().discriminator ?? "");
  const revalidator = useRevalidator();
  const pending = result === null;

  const loaded = result?.status === "ok" && result.data.kind === kind ? result.data : undefined;
  const name = loaded
    ? loaded.kind === "player"
      ? displayName(loaded.recap.prefix, loaded.recap.gamerTag)
      : loaded.recap.gamerTag
    : initialName;
  const isEmpty = loaded ? loaded.recap.totalTournaments === 0 : false;
  const notFound = result?.status === "not-found";
  const unavailable = result?.status === "unavailable";

  // The head is sent before a slow recap arrives; once it is here, the tab gets the real name.
  useEffect(() => {
    if (!loaded || !name) return;
    document.title =
      kind === "player" ? `${name}’s ${RECAP_YEAR} on SmashRecap` : `${name}’s ${RECAP_YEAR} as an organiser on SmashRecap`;
  }, [loaded, name, kind]);

  // Remotion only runs in the browser, so the player mounts after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const otherKind: RecapKind = kind === "player" ? "organizer" : "player";

  const resultLines: StatLine[] =
    loaded && !isEmpty
      ? loaded.kind === "player"
        ? pick(playerStatGroups(loaded.recap), ["tournaments", "sets", "deciding", "spr"])
        : pick(organizerStatGroups(loaded.recap), ["to-tournaments", "to-biggest", "to-games", "to-series"])
      : [];

  // The Remotion Player focuses its play button when it mounts; give focus back to the page.
  const playerRef = useRef<HTMLDivElement>(null);
  const hasPlayer = Boolean(loaded) && !isEmpty;
  useEffect(() => {
    const container = playerRef.current;
    if (!hasPlayer || !mounted || !container) return;
    const started = performance.now();
    let touched = false;
    const onInput = () => (touched = true);
    const onFocus = (event: FocusEvent) => {
      if (!touched && performance.now() - started < 2000) (event.target as HTMLElement).blur();
    };
    window.addEventListener("keydown", onInput, { once: true });
    window.addEventListener("pointerdown", onInput, { once: true });
    container.addEventListener("focusin", onFocus);
    return () => {
      window.removeEventListener("keydown", onInput);
      window.removeEventListener("pointerdown", onInput);
      container.removeEventListener("focusin", onFocus);
    };
  }, [hasPlayer, mounted]);

  return (
    <div className="recap">
      <header className="recap__bar">
        <Wordmark />
        <nav aria-label="Recap" className="recap__nav">
          <Link className="link recap__bar-link" to="/">
            Look up another player
          </Link>
        </nav>
        <SettingsToggles />
      </header>

      <main className="recap__main">
        <div className="recap__monitor">
          <div className="recap__screen glass">
            {loaded && !isEmpty ? (
              <div className="recap__player" ref={playerRef}>
                {mounted ? (
                  <Suspense fallback={<PlayerLoading />}>
                    <RecapPlayer input={loaded} />
                  </Suspense>
                ) : (
                  <PlayerLoading />
                )}
              </div>
            ) : (
              <div className="recap__signal">
                {(pending || notFound || unavailable) && <Static className="recap__snow" running={pending} />}
                {pending && (
                  <>
                    <p className="recap__signal-title">
                      Reading {RECAP_YEAR}
                      <span className="recap__cursor" aria-hidden="true" />
                    </p>
                    <p className="recap__signal-text">
                      Pulling every {kind === "player" ? "set" : "tournament"} for start.gg/user/{discriminator}. Big
                      seasons take up to a minute the first time.
                    </p>
                  </>
                )}
                {notFound && (
                  <>
                    <p className="recap__signal-title">No signal</p>
                    <p className="recap__signal-text">
                      start.gg has no account at user/{discriminator}. Search for the player by tag instead.
                    </p>
                    <SearchConsole variant="compact" defaultKind={kind} />
                  </>
                )}
                {unavailable && (
                  <>
                    <p className="recap__signal-title">Lost signal</p>
                    <p className="recap__signal-text">start.gg did not answer in time. Your recap is not lost.</p>
                    <button className="button" type="button" onClick={() => revalidator.revalidate()}>
                      Try again
                    </button>
                  </>
                )}
                {isEmpty && name && (
                  <>
                    <p className="recap__signal-title">Nothing to replay yet</p>
                    <p className="recap__signal-text">
                      {kind === "player"
                        ? `${name} has no Ultimate sets on start.gg in ${RECAP_YEAR} so far.`
                        : `${name} has not organised a start.gg tournament in ${RECAP_YEAR} so far.`}
                    </p>
                    <Link className="button" to={recapPath(otherKind, discriminator)}>
                      See the {otherKind === "player" ? "player" : "organiser"} recap
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="recap__bezel">
            <a className="link" href={`https://www.start.gg/user/${discriminator}`} target="_blank" rel="noreferrer">
              start.gg/user/{discriminator}
            </a>
            <span>{KIND_LABEL[kind]}</span>
          </div>
        </div>

        <section className="recap__side" aria-labelledby="recap-title">
          <div className="recap__intro">
            <h1 id="recap-title" className="recap__title">
              {name ? `${name}’s ${RECAP_YEAR}` : notFound ? "No recap at this address" : `Loading a ${RECAP_YEAR} recap`}
            </h1>
            <p className="recap__summary">
              {loaded
                ? loaded.kind === "player"
                  ? playerSummary(loaded.recap)
                  : `${formatNumber(loaded.recap.totalTournaments)} tournaments organised on start.gg in ${RECAP_YEAR}, across ${loaded.recap.gamesOrganized.length} games.`
                : notFound
                  ? "The link may be mistyped, or the account was deleted on start.gg."
                  : "The video plays here as soon as the numbers are in."}
            </p>
            {resultLines.length > 0 && (
              <dl className="recap__stats">
                {resultLines.map((line) => (
                  <div key={line.id}>
                    <dt>{line.name}</dt>
                    <dd>
                      <PixelNumber value={line.figure} label={line.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {!notFound && (
            <>
              <nav className="recap__kinds" aria-label="Recap type">
                {(["player", "organizer"] as const).map((value) => (
                  <Link
                    key={value}
                    to={recapPath(value, discriminator)}
                    className="recap__kind"
                    aria-current={value === kind ? "page" : undefined}
                    replace
                  >
                    {KIND_LABEL[value]}
                  </Link>
                ))}
              </nav>

              <RecapActions
                shareUrl={shareUrl}
                ready={Boolean(loaded) && !isEmpty}
                name={name ?? discriminator}
                recap={loaded}
              />
            </>
          )}

          {loaded?.kind === "player" && loaded.recap.skippedEventCount > 0 && (
            <p className="recap__note">
              {loaded.recap.skippedEventCount} {loaded.recap.skippedEventCount === 1 ? "event" : "events"} could not be
              read from start.gg and {loaded.recap.skippedEventCount === 1 ? "is" : "are"} not counted.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

function pick<T extends { id: string }>(groups: { lines: T[] }[], ids: string[]) {
  const lines = groups.flatMap((g) => g.lines);
  return ids.map((id) => lines.find((l) => l.id === id)).filter((l): l is T => Boolean(l));
}
