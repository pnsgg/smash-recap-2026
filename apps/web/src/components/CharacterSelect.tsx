import type { PlayerRecapProps } from "@shared";
import { Suspense, use, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Link } from "react-router";
import { recapPath, type Settled } from "../api";
import { RECAP_YEAR } from "../config";
import { FEATURED_PLAYERS, type FeaturedPlayer } from "../data/featured";
import { useReveal } from "../hooks/useReveal";
import { play } from "../lib/sound";
import { displayName, formatNumber, formatPercent, formatSigned, playerSummary } from "../lib/stats";
import { PixelNumber } from "./PixelNumber";
import { Static } from "./Static";
import "./CharacterSelect.css";

type Props = {
  /** Streamed by the home route's loader, one per player of FEATURED_PLAYERS, in the same order. */
  recaps: Promise<Settled<PlayerRecapProps>>[];
};

/** Top players as a character select screen: portraits, a P1 token that follows you, the pick on a monitor. */
export function CharacterSelect({ recaps }: Props) {
  const sectionRef = useReveal<HTMLElement>();
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState<{ x: number; y: number } | null>(null);
  const pointed = hover ?? index;

  // The P1 token sits on the corner of whichever portrait the pointer or focus is on.
  useLayoutEffect(() => {
    const place = () => {
      const tile = gridRef.current?.querySelector<HTMLElement>(`[data-index="${pointed}"]`);
      if (tile) setToken({ x: tile.offsetLeft + tile.offsetWidth * 0.62, y: tile.offsetTop + tile.offsetWidth * 0.5 });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [pointed]);

  const pick = (i: number) => {
    if (i !== index) play("select");
    setIndex(i);
  };

  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = FEATURED_PLAYERS.length - 1;
    const cols = 3;
    const moves: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowDown: Math.min(last, index + cols),
      ArrowUp: Math.max(0, index - cols),
      Home: 0,
      End: last,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    pick(next);
    document.getElementById(`player-tab-${next}`)?.focus();
  };

  const player = FEATURED_PLAYERS[index]!;

  return (
    <section className="select" id="top-players" ref={sectionRef} aria-labelledby="select-title">
      <div className="select__head">
        <h2 id="select-title" data-reveal>
          Top players’ recaps
        </h2>
        <p data-reveal style={{ "--i": 1 } as CSSProperties}>
          Pick a player to see their {RECAP_YEAR} in numbers, then watch the full recap.
        </p>
      </div>

      <div className="select__body">
        <div
          className="select__grid"
          ref={gridRef}
          role="tablist"
          aria-label="Featured players"
          data-reveal
          style={{ "--i": 2 } as CSSProperties}
          onPointerLeave={() => setHover(null)}
        >
          {FEATURED_PLAYERS.map((p, i) => (
            <button
              key={p.discriminator}
              id={`player-tab-${i}`}
              data-index={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-controls="player-panel"
              tabIndex={i === index ? 0 : -1}
              className="select__tile"
              onClick={() => pick(i)}
              onKeyDown={onKey}
              onPointerEnter={() => {
                if (i !== pointed) play("blip");
                setHover(i);
              }}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
            >
              <Portrait player={p} className="select__portrait" />
              <span className="select__plate">{p.gamerTag}</span>
            </button>
          ))}
          {token && (
            <span className="select__token" aria-hidden="true" style={{ transform: `translate(${token.x}px, ${token.y}px)` }}>
              P1
            </span>
          )}
        </div>

        <PlayerStage player={player} index={index} recap={recaps[index]!} />
      </div>
    </section>
  );
}

function Portrait({ player, className }: { player: FeaturedPlayer; className: string }) {
  const [failed, setFailed] = useState(false);
  if (!player.profilePictureUrl || failed) {
    return (
      <span className={`${className} select__initial`} aria-hidden="true">
        {player.gamerTag.slice(0, 2)}
      </span>
    );
  }
  return (
    <img
      className={className}
      src={player.profilePictureUrl}
      alt=""
      width={400}
      height={400}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function PlayerStage({
  player,
  index,
  recap,
}: {
  player: FeaturedPlayer;
  index: number;
  recap: Promise<Settled<PlayerRecapProps>>;
}) {
  const name = displayName(player.prefix, player.gamerTag);

  return (
    <div id="player-panel" role="tabpanel" aria-labelledby={`player-tab-${index}`} className="select__stage">
      <div className="select__monitor">
        <div className="select__glass glass" key={player.discriminator}>
          <Portrait player={player} className="select__big" />
          <Static className="select__snow" running={false} density={0.6} />
        </div>
      </div>

      <div className="select__info" key={`info-${player.discriminator}`}>
        <h3 className="select__name">{name}</h3>
        <Suspense fallback={<PlayerNumbers numbers={null} />}>
          <ResolvedNumbers recap={recap} />
        </Suspense>
        <div className="select__actions">
          <Link className="button" to={recapPath("player", player.discriminator)} onClick={() => play("coin")}>
            Watch {player.gamerTag}’s recap
          </Link>
          <a
            className="button button--raised"
            href={`https://www.start.gg/user/${player.discriminator}`}
            target="_blank"
            rel="noreferrer"
          >
            start.gg profile
          </a>
        </div>
      </div>
    </div>
  );
}

function ResolvedNumbers({ recap }: { recap: Promise<Settled<PlayerRecapProps>> }) {
  const settled = use(recap);
  return <PlayerNumbers numbers={settled.status === "ok" ? settled.data : "unavailable"} />;
}

const STAT_LABELS = ["Clean sweeps", "Reverse sweeps won", "Close sets won", "Best run"];

/** The summary and four figures; "…" while the recap streams in, "–" if start.gg could not be reached. */
function PlayerNumbers({ numbers }: { numbers: PlayerRecapProps | "unavailable" | null }) {
  const recap = numbers && numbers !== "unavailable" ? numbers : null;
  const best = recap?.bestPerformances[0];
  const mark = numbers === "unavailable" ? "–" : "...";
  const values = recap
    ? [
        formatNumber(recap.cleanSweeps),
        String(recap.reverseSweeps.won),
        recap.decidingGameSets.count ? formatPercent(recap.decidingGameSets.winRate) : "–",
        best ? formatSigned(best.spr) : "–",
      ]
    : STAT_LABELS.map(() => mark);

  let summary = `Reading their ${RECAP_YEAR} from start.gg…`;
  if (recap) summary = playerSummary(recap);
  else if (numbers === "unavailable") summary = "start.gg did not answer in time. The full recap may still load.";

  return (
    <>
      <p className="select__summary">{summary}</p>
      <dl className="select__stats">
        {STAT_LABELS.map((label, i) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              <PixelNumber value={values[i]!} />
            </dd>
          </div>
        ))}
      </dl>
      <p className="select__note">
        {best ? `Best run at ${best.tournamentName}. ` : ""}Numbers from start.gg, refreshed daily.
      </p>
    </>
  );
}
