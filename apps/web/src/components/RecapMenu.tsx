import type { PlayerRecapProps, TournamentOrganizerRecapProps } from "@shared";
import { Suspense, use, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Settled } from "../api";
import { MENU_EXAMPLE_ORGANIZER, MENU_EXAMPLE_PLAYER } from "../data/featured";
import { useReveal } from "../hooks/useReveal";
import { play } from "../lib/sound";
import {
  displayName,
  organizerStatGroups,
  placeholderOrganizerStatGroups,
  placeholderPlayerStatGroups,
  playerStatGroups,
  type StatGroup,
  type StatLine,
} from "../lib/stats";
import { PixelNumber } from "./PixelNumber";
import "./RecapMenu.css";

type Tab = "player" | "organizer";

const WHO: Record<Tab, string> = {
  player: displayName(MENU_EXAMPLE_PLAYER.prefix, MENU_EXAMPLE_PLAYER.gamerTag),
  organizer: displayName(MENU_EXAMPLE_ORGANIZER.prefix, MENU_EXAMPLE_ORGANIZER.gamerTag),
};

const FIRST_LINE: Record<Tab, string> = { player: "sets", organizer: "to-tournaments" };

type Props = {
  /** Streamed by the home route's loader. */
  player: Promise<Settled<PlayerRecapProps>>;
  organizer: Promise<Settled<TournamentOrganizerRecapProps>>;
};

export function RecapMenu({ player, organizer }: Props) {
  const sectionRef = useReveal<HTMLElement>();
  const [tab, setTab] = useState<Tab>("player");
  const [activeId, setActiveId] = useState(FIRST_LINE.player);

  const board = {
    tab,
    activeId,
    onActive: setActiveId,
    onTab: (value: Tab) => {
      play("select");
      setTab(value);
      setActiveId(FIRST_LINE[value]);
    },
  };
  const pending = tab === "player" ? placeholderPlayerStatGroups("...") : placeholderOrganizerStatGroups("...");

  return (
    <section className="menu" id="whats-counted" ref={sectionRef} aria-labelledby="menu-title">
      <div className="menu__head">
        <h2 id="menu-title" data-reveal>
          What’s in your recap
        </h2>
        <p className="menu__intro" data-reveal style={{ "--i": 1 } as CSSProperties}>
          Every line is computed from your own start.gg {tab === "player" ? "sets" : "tournaments"}, then cut into the
          video. The values here are {WHO[tab]}’s numbers for 2026.
        </p>
      </div>

      {/* Each tab waits for its own recap; until then the lines show "…". */}
      <Suspense key={tab} fallback={<MenuBoard {...board} groups={pending} />}>
        {tab === "player" ? (
          <ResolvedBoard {...board} result={player} groupsOf={playerStatGroups} placeholder={placeholderPlayerStatGroups} />
        ) : (
          <ResolvedBoard
            {...board}
            result={organizer}
            groupsOf={(recap) => organizerStatGroups(recap, MENU_EXAMPLE_ORGANIZER.prefix)}
            placeholder={placeholderOrganizerStatGroups}
          />
        )}
      </Suspense>
    </section>
  );
}

type BoardProps = {
  tab: Tab;
  activeId: string;
  onActive: (id: string) => void;
  onTab: (tab: Tab) => void;
};

function ResolvedBoard<T>({
  result,
  groupsOf,
  placeholder,
  ...board
}: BoardProps & {
  result: Promise<Settled<T>>;
  groupsOf: (recap: T) => StatGroup[];
  placeholder: (mark: string) => StatGroup[];
}) {
  const settled = use(result);
  // start.gg unreachable: the lines stay, with a dash instead of a number.
  const groups = settled.status === "ok" ? groupsOf(settled.data) : placeholder("–");
  return <MenuBoard {...board} groups={groups} />;
}

function MenuBoard({ tab, activeId, onActive, onTab, groups }: BoardProps & { groups: StatGroup[] }) {
  const lines = groups.flatMap((g) => g.lines);
  const active: StatLine = lines.find((l) => l.id === activeId) ?? lines[0]!;

  // While the menu scrolls past, the line crossing the middle of the screen drives the readout.
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = listRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onActive((entry.target as HTMLElement).dataset.line!);
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    root.querySelectorAll("[data-line]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [tab, onActive]);

  return (
    <div className="menu__grid">
      <div className="menu__sheet" ref={listRef} data-reveal style={{ "--i": 2 } as CSSProperties}>
        <div className="menu__tabs" role="tablist" aria-label="Recap type">
          {(["player", "organizer"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              id={`menu-tab-${value}`}
              aria-selected={tab === value}
              aria-controls="menu-panel"
              className="menu__tab"
              onClick={() => onTab(value)}
            >
              {value === "player" ? "As a player" : "As an organiser"}
            </button>
          ))}
        </div>

        <div id="menu-panel" role="tabpanel" aria-labelledby={`menu-tab-${tab}`} className="menu__panel" key={tab}>
          <p className="menu__who">{WHO[tab]}, 2026</p>
          {groups.map((group) => (
            <div key={group.name} className="menu__group">
              <h3 className="menu__group-name">{group.name}</h3>
              <ul>
                {group.lines.map((line) => (
                  <li key={line.id} data-line={line.id}>
                    <button
                      type="button"
                      className="menu__line"
                      aria-pressed={line.id === active.id}
                      onClick={() => {
                        play("blip");
                        onActive(line.id);
                      }}
                      onFocus={() => onActive(line.id)}
                    >
                      <span className="menu__name">{line.name}</span>
                      <span className="menu__leader" aria-hidden="true" />
                      <span className="menu__value">{line.value}</span>
                      <span className="menu__desc">{line.description}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <aside className="menu__readout" aria-live="polite" aria-label="Selected line">
        <div className="menu__readout-inner">
          <p className="menu__figure" key={active.id + active.figure}>
            <PixelNumber value={active.figure} />
          </p>
          <p className="menu__caption">{active.caption}</p>
        </div>
      </aside>
    </div>
  );
}
