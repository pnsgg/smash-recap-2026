import { Still } from "remotion";
import { findGame, type TournamentOrganizerRecapProps } from "@shared";
import { licaneTournamentOrganiserRecap } from "@shared/fixtures/tournament-organiser-recap";
import { PixelText, pixelWidth } from "../../compositions/PlayerRecapArcade/components/Pixel";
import { caption, color, display, displayCase } from "../../compositions/PlayerRecapArcade/theme";
import { loadFonts } from "../../lib/fonts";
import { BigName, CARD, CardImg, CardPage, GAP, Label, OneLine, PAD, Panel, Pill, Portrait, thousands } from "./kit";

loadFonts();

export type OrganizerCardProps = TournamentOrganizerRecapProps & {
  /** The season the recap covers. */
  year?: number;
};

const HERO = 372;

/** A game by the name players use ("Ultimate", "Melee") when it is one the site covers, else start.gg's name. */
const gameName = (game: TournamentOrganizerRecapProps["gamesOrganized"][number]) =>
  findGame(game.videogameId)?.short ?? game.videogameName;
const ROWS = 5;
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

/** The attendee figure as large as fits its 172-unit box: 5 px blocks, smaller for 4-digit counts. */
const FIGURE_ROOM = 172 - 16 - 12;
const figurePx = (text: string) => [5, 4, 3, 2].find((px) => pixelWidth(text, px) <= FIGURE_ROOM) ?? 2;

/** One tournament: logo, how many came, and its name. */
const TournamentRow: React.FC<{ tournament: TournamentOrganizerRecapProps["biggestTournaments"][number]; top: boolean }> = ({
  tournament,
  top,
}) => (
  <div style={{ display: "flex", height: 64, overflow: "hidden", backgroundColor: color.ground }}>
    <div style={{ width: 64, flex: "none", backgroundColor: color.raised2 }}>
      <CardImg src={tournament.tournamentImageUrl} style={{ width: 64, height: 64, objectFit: "cover" }} />
    </div>
    <div
      style={{
        width: 172,
        flex: "none",
        display: "flex",
        alignItems: "center",
        gap: 10,
        paddingLeft: 16,
        backgroundColor: top ? color.gold : color.raised,
      }}
    >
      <PixelText text={thousands(tournament.attendees)} px={figurePx(thousands(tournament.attendees))} fill={top ? color.ground : color.ink} />
    </div>
    <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", padding: "0 16px" }}>
      <OneLine text={tournament.tournamentName} width={600} size={18} />
    </div>
  </div>
);

/** Tournaments run each month, as pixel bars, the busiest in gold. */
const Months: React.FC<{ months: TournamentOrganizerRecapProps["tournamentsByMonth"] }> = ({ months }) => {
  const max = Math.max(1, ...months.map((m) => m.count));
  const busiest = months.reduce<(typeof months)[number] | null>((top, m) => (m.count > 0 && (!top || m.count > top.count) ? m : top), null);
  const BAR_H = 112;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: "100%" }}>
      {months.map((m, i) => {
        const h = m.count > 0 ? Math.max(8, Math.round((m.count / max) * BAR_H / 8) * 8) : 4;
        const lit = busiest !== null && m.month === busiest.month;
        return (
          <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            {lit ? <PixelText text={String(m.count)} px={2} fill={color.gold} /> : <div style={{ height: 14 }} />}
            {/* Plain boxes, no CSS gradient or stretched SVG: the in-browser image renderer drops both. */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: h,
                overflow: "hidden",
                backgroundColor: lit ? color.gold : m.count > 0 ? color.casingDeep : color.raised2,
              }}
            >
              {Array.from({ length: Math.floor(h / 8) }, (_, k) => (
                <div
                  key={k}
                  style={{ position: "absolute", left: 0, right: 0, bottom: k * 8, height: 2, backgroundColor: "rgba(0,0,0,0.28)" }}
                />
              ))}
            </div>
            <div style={{ ...caption, fontSize: 12 }}>{MONTHS[i] ?? m.month.charAt(0)}</div>
          </div>
        );
      })}
    </div>
  );
};

export const OrganizerCard: React.FC<OrganizerCardProps> = ({ year = 2026, ...recap }) => {
  const totalEvents = recap.gamesOrganized.reduce((sum, game) => sum + game.count, 0);
  const topGame = recap.gamesOrganized[0] ?? null;
  const biggest = recap.biggestTournaments.filter((t) => t.attendees > 0).slice(0, ROWS);
  const busiestDay = recap.dayOfWeekActivity.reduce<(typeof recap.dayOfWeekActivity)[number] | null>(
    (top, d) => (d.count > 0 && (!top || d.count > top.count) ? d : top),
    null,
  );
  return (
    <CardPage>
      <div style={{ position: "absolute", left: PAD, top: 32, width: 560 }}>
        <div style={{ ...caption, fontSize: 14, color: color.osd }}>SEASON {year} · TOURNAMENT ORGANIZER</div>
        <div style={{ height: 30, marginTop: 14 }} />
        <div style={{ marginTop: 12 }}>
          <BigName text={recap.gamerTag} width={540} />
        </div>
      </div>
      <div style={{ position: "absolute", left: PAD, top: 236, display: "flex", gap: 16 }}>
        <Pill label="Tournaments" value={String(recap.totalTournaments)} />
        <Pill label="Events" value={String(totalEvents)} />
        <Pill label="Games" value={String(recap.gamesOrganized.length)} fill={color.gold} />
      </div>
      {busiestDay ? (
        <div style={{ position: "absolute", left: PAD, top: 322, display: "flex", alignItems: "center", gap: 12 }}>
          <Label tone={color.muted}>Busiest day</Label>
          <div style={display(32, color.gold)}>{displayCase(busiestDay.day)}</div>
          <OneLine text={`${busiestDay.count} tournaments`} width={300} size={15} />
        </div>
      ) : null}
      <Portrait avatarUrl={recap.avatarUrl} slot="TO" caption={topGame ? gameName(topGame) : null} height={HERO - 40} />

      <div style={{ position: "absolute", left: PAD, right: PAD, top: HERO + 12, bottom: 52, display: "flex", flexDirection: "column", gap: GAP }}>
        {biggest.length > 0 ? (
          <Panel title="BIGGEST TOURNAMENTS" note="Attendees" bodyStyle={{ padding: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            {biggest.map((t, i) => (
              <TournamentRow key={`${t.tournamentName}-${i}`} tournament={t} top={i === 0} />
            ))}
          </Panel>
        ) : null}

        <div style={{ flex: 1, minHeight: 0, display: "flex", gap: GAP }}>
          <Panel title="GAMES RUN" note="Events" style={{ width: 300, flex: "none" }} bodyStyle={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {recap.gamesOrganized.slice(0, 4).map((game) => (
              <div key={game.videogameId} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, flex: "none", overflow: "hidden", backgroundColor: color.raised2 }}>
                  <CardImg src={game.imageUrl} style={{ width: 34, height: 34, objectFit: "cover" }} />
                </div>
                <OneLine text={gameName(game)} width={150} size={14} style={{ flex: 1, minWidth: 0 }} />
                <PixelText text={String(game.count)} px={3} fill={color.gold} />
              </div>
            ))}
          </Panel>

          <Panel title="BY MONTH" note="Tournaments" style={{ flex: 1, minWidth: 0 }} bodyStyle={{ padding: "12px 14px 10px" }}>
            <Months months={recap.tournamentsByMonth} />
          </Panel>

          <Panel title="SERIES" note="Editions" style={{ width: 236, flex: "none" }} bodyStyle={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {recap.seriesOrganized.length === 0 ? (
              <Label>No series this season</Label>
            ) : (
              recap.seriesOrganized.slice(0, 4).map((s) => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, flex: "none", overflow: "hidden", backgroundColor: color.raised2 }}>
                    <CardImg src={s.imageUrl} style={{ width: 30, height: 30, objectFit: "cover" }} />
                  </div>
                  <OneLine text={s.name} width={112} size={14} style={{ flex: 1, minWidth: 0 }} />
                  <PixelText text={String(s.count)} px={3} fill={color.gold} />
                </div>
              ))
            )}
          </Panel>
        </div>
      </div>
    </CardPage>
  );
};

export const ORGANIZER_CARD_ID = "OrganizerCard";

export const OrganizerCardStill: React.FC = () => (
  <Still
    id={ORGANIZER_CARD_ID}
    component={OrganizerCard}
    width={CARD.width * CARD.scale}
    height={CARD.height * CARD.scale}
    defaultProps={licaneTournamentOrganiserRecap}
  />
);
