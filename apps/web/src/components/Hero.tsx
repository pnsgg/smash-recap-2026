import { GAMES, type PlayerRecapProps } from "@shared";
import { lazy, Suspense, use, useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router";
import { recapPath, type RecapStats, type Settled } from "../api";
import { RECAP_YEAR } from "../config";
import type { FeaturedPlayer } from "../data/featured";
import { play } from "../lib/sound";
import { SearchConsole } from "./SearchConsole";
import { SettingsToggles } from "./SettingsToggles";
import { Static } from "./Static";
import "./Hero.css";

const HEADLINE = `Your ${RECAP_YEAR} season as a recap video`;

/** The composite inputs on the TV's front: picture, then left and right sound. */
const JACKS = [
  { label: "Video", tone: "video" },
  { label: "L", tone: "left" },
  { label: "R", tone: "right" },
] as const;

const RecapLoop = lazy(() => import("./RecapLoop"));

export type HeroPreview = { player: FeaturedPlayer; recap: Promise<Settled<PlayerRecapProps>> };
type Props = { preview: HeroPreview; stats: Promise<Settled<RecapStats>> };

const useMounted = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
};

/** The station clock in the corner, in the visitor's own time. Browser only: the server can't know it. */
function Clock() {
  const mounted = useMounted();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 10_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="news__clock">
      {mounted ? now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : " "}
    </span>
  );
}

function LiveRecap({ recap }: { recap: Promise<Settled<PlayerRecapProps>> }) {
  const settled = use(recap);
  if (settled.status !== "ok") return null;
  return <RecapLoop recap={settled.data} />;
}

/** The box over the desk: a random top player's recap playing, with the link to it under. */
function OnAir({ player, recap }: HeroPreview) {
  const mounted = useMounted();
  const snow = <Static className="news__snow" />;
  return (
    <Link className="news__box" to={recapPath("player", player.discriminator)} onClick={() => play("coin")}>
      <span className="news__picture" data-ui>
        {mounted ? (
          <Suspense fallback={snow}>
            <LiveRecap recap={recap} />
          </Suspense>
        ) : (
          snow
        )}
      </span>
      <span className="news__strap">
        <span className="news__tag">On air</span>
        <span className="news__strap-text">Watch {player.gamerTag}’s recap</span>
      </span>
    </Link>
  );
}

const recaps = (n: number) => `${n.toLocaleString("en-US")} ${n === 1 ? "recap" : "recaps"}`;

/**
 * The crawl's lines: the season's count and the last day's from the API, then the games covered. A
 * count of zero, or one the API could not give, is left out rather than shown.
 */
function tickerItems(stats: Settled<RecapStats> | null): string[] {
  const counts: string[] = [];
  if (stats?.status === "ok") {
    const season = stats.data.season.players + stats.data.season.organizers;
    const today = stats.data.cached.players + stats.data.cached.organizers;
    if (season > 0) counts.push(`${recaps(season)} generated this season`);
    if (today > 0) counts.push(`${recaps(today)} generated in the last 24 hours`);
  }
  return [
    ...counts,
    `${RECAP_YEAR} recaps for ${GAMES.map((g) => g.short).join(", ")}`,
  ];
}

function TickerLines({ stats }: { stats: Promise<Settled<RecapStats>> }) {
  return <Crawl items={tickerItems(use(stats))} />;
}

/** Each pass repeats the lines this many times, so even one short line is wider than the widest screen. */
const REPEAT = 4;

/**
 * Two identical passes in a row, so the crawl can loop without a gap. Screen readers get the lines once:
 * every repeat after the first is hidden from them.
 */
function Crawl({ items }: { items: string[] }) {
  const lines = Array.from({ length: REPEAT }, () => items).flat();
  const run = (pass: number) => (
    <span className="news__run">
      {lines.map((item, i) => (
        <span key={i} className="news__item" aria-hidden={pass > 0 || i >= items.length || undefined}>
          {item}
        </span>
      ))}
    </span>
  );
  return (
    <span className="news__crawl" style={{ "--items": lines.length } as CSSProperties}>
      {run(0)}
      {run(1)}
    </span>
  );
}

export function Hero({ preview, stats }: Props) {
  return (
    <header className="cab">
      <div className="cab__stage">
        <div className="cab__casing">
          <div className="cab__tube">
            {/* The picture is laid out like a news channel: corner bugs, the desk with the box over it, the
                lower third carrying the headline and the crawl under it. */}
            <div className="cab__power glass news">
              <span className="news__bug" aria-hidden="true">
                SmashRecap {RECAP_YEAR}
              </span>
              <Clock />

              <div className="news__desk">
                <SearchConsole variant="panel" />
              </div>
              <OnAir {...preview} />

              <div className="news__third">
                <span className="news__label" aria-hidden="true">
                  Breaking news
                </span>
                <h1 className="news__headline">
                  <span className="cab__type" style={{ "--i": 1, "--chars": HEADLINE.length } as CSSProperties}>
                    {HEADLINE}
                  </span>
                </h1>
              </div>

              <p className="news__ticker">
                <span className="news__ticker-label">Latest</span>
                <Suspense fallback={<Crawl items={tickerItems(null)} />}>
                  <TickerLines stats={stats} />
                </Suspense>
              </p>
            </div>
          </div>

          {/* The TV's front panel: power light, the two switches every screen carries, speaker, inputs. */}
          <div className="cab__panel">
            <span className="cab__led" aria-hidden="true" />
            <SettingsToggles className="cab__buttons" />
            <span className="cab__speaker" aria-hidden="true">
              {Array.from({ length: 7 }, (_, i) => (
                <span key={i} />
              ))}
            </span>
            <div className="cab__jacks" aria-hidden="true">
              {JACKS.map((jack) => (
                <span key={jack.tone} className="cab__jack" data-tone={jack.tone}>
                  <span className="cab__socket" />
                  {jack.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
