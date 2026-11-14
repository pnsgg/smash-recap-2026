import { Still } from "remotion";
import type { PlayerRecapProps } from "@shared";
import { licanePlayerRecap } from "@shared/fixtures/player-recap";
import { PixelText } from "../../compositions/PlayerRecapArcade/components/Pixel";
import { ordinal } from "../../compositions/PlayerRecapArcade/acts/Rankings";
import { caption, color, display, displayCase } from "../../compositions/PlayerRecapArcade/theme";
import { loadFonts } from "../../lib/fonts";
import { BigName, CARD, CardImg, CardPage, GAP, Label, OneLine, PAD, Panel, Pill, Portrait, tagOnly, thousands } from "./kit";

loadFonts();

export type PlayerCardProps = PlayerRecapProps & {
  /** The game the recap is for, as the site names it: "Super Smash Bros. Ultimate". */
  gameName?: string;
  /** The season the recap covers. */
  year?: number;
};

const EVENT_ROWS = 4;
const HERO = 372;

/** UltRank's tier for the event, as a cabinet-plastic tab; an empty tab when UltRank does not rank it. */
const TierCell: React.FC<{ tier: string | null }> = ({ tier }) => (
  <div
    style={{
      width: 64,
      flex: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: tier ? color.casing : color.raised,
      boxShadow: tier ? `inset -4px 0 0 ${color.casingDeep}` : undefined,
    }}
  >
    {tier ? <div style={display(tier.length > 1 ? 32 : 48, color.ground)}>{tier}</div> : null}
  </div>
);

/** One event: logo, placement, the tournament and event names on a bar and the players beaten under it. */
const EventRow: React.FC<{ event: PlayerRecapProps["bestFinishes"][number]; tierColumn: boolean }> = ({ event, tierColumn }) => {
  const first = event.placement === 1;
  return (
    <div style={{ display: "flex", height: 84, overflow: "hidden", backgroundColor: color.ground }}>
      {tierColumn ? <TierCell tier={event.ultrankTier} /> : null}
      <div style={{ width: 84, flex: "none", backgroundColor: color.raised2 }}>
        <CardImg src={event.tournamentImageUrl} style={{ width: 84, height: 84, objectFit: "cover" }} />
      </div>
      <div
        style={{
          width: 136,
          flex: "none",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 16,
          gap: 8,
          backgroundColor: first ? color.gold : color.raised,
        }}
      >
        <div style={display(ordinal(event.placement).length > 4 ? 32 : 48, first ? color.ground : color.ink)}>
          {displayCase(ordinal(event.placement))}
        </div>
        <Label tone={first ? color.ground : color.muted}>of {thousands(event.entrants)}</Label>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ height: 30, display: "flex", alignItems: "center", gap: 12, padding: "0 12px", backgroundColor: color.raised2 }}>
          <OneLine text={event.tournamentName} width={tierColumn ? 330 : 380} size={16} style={{ flex: "none" }} />
          <OneLine text={event.eventName} width={tierColumn ? 190 : 230} size={14} weight={600} tone={color.muted} style={{ flex: 1, minWidth: 0 }} />
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "stretch" }}>
          {event.wins.length === 0 ? (
            <Label style={{ alignSelf: "center", paddingLeft: 12 }}>No sets won</Label>
          ) : (
            event.wins.map((win) => (
              <div
                key={`${win.name}-${win.seed}`}
                style={{
                  flex: "0 0 25%",
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  borderLeft: `1px solid ${color.raised2}`,
                }}
              >
                <div style={{ height: 26, display: "flex", alignItems: "center" }}>
                  <CardImg
                    src={win.stockIconUrl}
                    style={{ height: 26, width: 26, objectFit: "contain" }}
                    fallback={<div style={display(16, color.muted)}>?</div>}
                  />
                </div>
                <OneLine text={tagOnly(win.name)} width={148} size={12} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/** Rival and nemesis: who they are and the set count, in a big pill. */
const HeadToHead: React.FC<{ title: string; tone: string; entry: PlayerRecapProps["rival"] }> = ({ title, tone, entry }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <Label tone={tone}>{title}</Label>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 44, height: 44, flex: "none", overflow: "hidden", backgroundColor: color.raised2 }}>
        <CardImg src={entry?.avatarUrl ?? null} style={{ width: 44, height: 44, objectFit: "cover" }} />
      </div>
      <OneLine
        text={entry ? (entry.gamerTag ?? `#${entry.opponentPlayerId}`) : "Nobody 3+ times"}
        width={entry ? 84 : 170}
        size={17}
        style={{ flex: 1, minWidth: 0 }}
      />
      {entry ? (
        <div style={{ flex: "none", padding: "7px 10px", backgroundColor: tone }}>
          <PixelText text={`${entry.playerWonSet}-${entry.opponentWonSet}`} px={3} fill={color.ground} />
        </div>
      ) : null}
    </div>
  </div>
);

const StatLine: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
    <Label style={{ fontSize: 11, letterSpacing: "0.04em" }}>{label}</Label>
    <PixelText text={value} px={value.length > 5 ? 2 : 3} fill={color.gold} />
  </div>
);

export const PlayerCard: React.FC<PlayerCardProps> = ({ gameName = "Super Smash Bros. Ultimate", year = 2026, ...recap }) => {
  const { won, lost } = recap.setRecord;
  const rate = won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0;
  const main = recap.mostPlayedCharacters[0] ?? null;
  const ranking = recap.rankings[0] ?? null;
  const events = recap.bestFinishes.slice(0, EVENT_ROWS);
  // The tier column only shows when UltRank ranks at least one of the events.
  const tierColumn = events.some((event) => event.ultrankTier !== null);
  const beaten = recap.mostBeaten.slice(0, 10);

  return (
    <CardPage>
      {/* Hero: who, which season, the headline numbers */}
      <div style={{ position: "absolute", left: PAD, top: 32, width: 560 }}>
        <div style={{ ...caption, fontSize: 14, color: color.osd }}>
          SEASON {year} · {gameName.toUpperCase()}
        </div>
        <div style={{ height: 30, marginTop: 14 }}>
          {recap.prefix ? (
            <div
              style={{
                display: "inline-block",
                padding: "6px 10px",
                backgroundColor: color.casing,
                ...display(16, color.ground),
              }}
            >
              {displayCase(recap.prefix)}
            </div>
          ) : null}
        </div>
        <div style={{ marginTop: 12 }}>
          <BigName text={recap.gamerTag} width={540} />
        </div>
      </div>
      <div style={{ position: "absolute", left: PAD, top: 236, display: "flex", gap: 16 }}>
        <Pill label="Tournaments" value={String(recap.totalTournaments)} />
        <Pill label="Sets won-lost" value={`${won}-${lost}`} />
        <Pill label="Sets won" value={`${rate}%`} fill={color.gold} />
      </div>
      {ranking ? (
        <div style={{ position: "absolute", left: PAD, top: 318, width: 500, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, flex: "none", overflow: "hidden", backgroundColor: color.raised2 }}>
            <CardImg src={ranking.imageUrl} style={{ width: 36, height: 36, objectFit: "cover" }} />
          </div>
          <div style={display(32, color.gold)}>{displayCase(ordinal(ranking.rank))}</div>
          <OneLine text={`${ranking.seriesName} · ${ranking.title}`} width={340} size={15} />
        </div>
      ) : null}
      <Portrait avatarUrl={recap.avatarUrl} slot="1P" caption={main?.characterName ?? null} renderUrl={main?.renderUrl ?? null} height={HERO - 40} />

      {/* Body: biggest events, then the panels */}
      <div
        style={{
          position: "absolute",
          left: PAD,
          right: PAD,
          top: HERO + 12,
          bottom: 52,
          display: "flex",
          flexDirection: "column",
          gap: GAP,
        }}
      >
        {events.length > 0 ? (
          <Panel title="BEST FINISHES" note={tierColumn ? "UltRank tier · players beaten, top seed first" : "Players beaten, top seed first"} bodyStyle={{ padding: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            {events.map((event) => (
              <EventRow key={`${event.tournamentName}-${event.eventName}`} event={event} tierColumn={tierColumn} />
            ))}
          </Panel>
        ) : null}

        <div style={{ flex: 1, minHeight: 0, display: "flex", gap: GAP }}>
          <Panel title="HEAD TO HEAD" style={{ width: 268, flex: "none" }} bodyStyle={{ padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
            <HeadToHead title="Rival · most sets played" tone={color.casing} entry={recap.rival} />
            <HeadToHead title="Nemesis · worst record" tone={color.accent} entry={recap.nemesis} />
          </Panel>

          <Panel title="MOST WINS OVER" note="Sets won" style={{ flex: 1, minWidth: 0 }} bodyStyle={{ padding: 10 }}>
            {beaten.length === 0 ? (
              <Label style={{ padding: 6 }}>No sets won this season</Label>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gridAutoRows: "1fr", gap: 6, height: "100%" }}>
                {beaten.map((o) => (
                  <div
                    key={o.name}
                    style={{
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      backgroundColor: color.ground,
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                      <div style={{ height: 28, display: "flex", alignItems: "center" }}>
                        <CardImg
                          src={o.stockIconUrl}
                          style={{ height: 28, width: 28, objectFit: "contain" }}
                          fallback={<div style={display(16, color.muted)}>?</div>}
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 1, paddingBottom: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 12, lineHeight: 1, color: color.gold }}>×</div>
                        <PixelText text={String(o.count)} px={2} fill={color.gold} />
                      </div>
                    </div>
                    <OneLine text={tagOnly(o.name)} width={58} size={12} />
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="PLAYED" style={{ width: 236, flex: "none" }} bodyStyle={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {recap.mostPlayedCharacters.slice(0, 4).map((c) => (
                <div key={c.characterId} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 40, height: 40, backgroundColor: color.ground, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CardImg src={c.stockIconUrl} style={{ width: 30, height: 30, objectFit: "contain" }} />
                  </div>
                  <PixelText text={String(c.count)} px={2} fill={color.muted} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
              <StatLine label="Clean sweeps" value={String(recap.cleanSweeps)} />
              <StatLine label="Last game, won" value={`${recap.decidingGameSets.winCount}/${recap.decidingGameSets.count}`} />
              <StatLine label="Reverse sweeps" value={String(recap.reverseSweeps.won)} />
            </div>
          </Panel>
        </div>
      </div>
    </CardPage>
  );
};

export const PLAYER_CARD_ID = "PlayerCard";

export const PlayerCardStill: React.FC = () => (
  <Still
    id={PLAYER_CARD_ID}
    component={PlayerCard}
    width={CARD.width * CARD.scale}
    height={CARD.height * CARD.scale}
    defaultProps={licanePlayerRecap}
  />
);
