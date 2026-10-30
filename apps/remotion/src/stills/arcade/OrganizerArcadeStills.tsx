import { Fragment } from "react";
import { Still } from "remotion";
import type { TournamentOrganizerRecapProps } from "@shared";
import { licaneTournamentOrganiserRecap } from "@shared/fixtures/tournament-organiser-recap";
import { PixelImage } from "../../compositions/PlayerRecapArcade/components/PixelImage";
import { PixelText, Sprite } from "../../compositions/PlayerRecapArcade/components/Pixel";
import { COIN_STACKED, CROWN, GOLD, TICKET, TICKET_PALETTE } from "../../compositions/PlayerRecapArcade/components/sprites";
import { dayName } from "../../compositions/PlayerRecapArcade/data";
import { caption, color, display, displayCase, fitDisplay, font } from "../../compositions/PlayerRecapArcade/theme";
import { deriveOperator, type OperatorData } from "../../compositions/TournamentOrganizerRecapArcade/data";
import { loadFonts } from "../../lib/fonts";
import type { StillFormatKey } from "../formats";
import { STILL_FORMAT_KEYS, STILL_FORMATS, stillIdSuffix } from "../formats";
import { Panel, StillFigure, StillPage, type PanelSpec } from "./kit";

loadFonts();

const GOLD_SHADE = GOLD.c;

const MONTH_NAMES: Record<string, string> = {
  Jan: "JANUARY",
  Feb: "FEBRUARY",
  Mar: "MARCH",
  Apr: "APRIL",
  May: "MAY",
  Jun: "JUNE",
  Jul: "JULY",
  Aug: "AUGUST",
  Sep: "SEPTEMBER",
  Oct: "OCTOBER",
  Nov: "NOVEMBER",
  Dec: "DECEMBER",
};

const Logo: React.FC<{ src: string | null; side: number }> = ({ src, side }) => (
  <div style={{ width: side, height: side, flex: "none", border: `5px solid ${color.casingDeep}`, backgroundColor: color.raised }}>
    <PixelImage src={src} rows={side / 6} px={6} mode="photo" levels={5} />
  </div>
);

const CoinChart: React.FC<{ columns: { label: string; count: number }[]; width: number; height: number; highlight: number }> = ({
  columns,
  width,
  height,
  highlight,
}) => {
  const pitch = width / columns.length;
  const coinPx = Math.max(1, Math.min(4, Math.floor((pitch - 4) / 10)));
  const max = Math.max(1, ...columns.map((c) => c.count));
  const chartH = height - 34;
  const step = Math.min(coinPx * 4, (chartH - coinPx * 4 - 30) / max);
  // Below about two sprite pixels a coin, each one's dark edge hides the gold of the coin under it.
  const dense = step < coinPx * 2;
  return (
    <div style={{ position: "relative", width, height }}>
      {columns.map((c, i) => (
        <Fragment key={i}>
          {dense && c.count > 1 ? (
            // Too many coins to tell apart: a gold pile of the same height, one coin on top.
            <div
              style={{
                position: "absolute",
                left: i * pitch + (pitch - 10 * coinPx) / 2 + coinPx,
                top: chartH - coinPx * 2 - (c.count - 1) * step,
                width: 8 * coinPx,
                height: (c.count - 1) * step + coinPx,
                boxSizing: "border-box",
                backgroundColor: GOLD_SHADE,
                borderLeft: `${coinPx}px solid ${color.gold}`,
                borderRight: `${coinPx}px solid #050606`,
              }}
            />
          ) : null}
          {Array.from({ length: dense ? Math.min(c.count, 1) : c.count }, (_, k) => {
            const level = dense ? c.count - 1 : k;
            return (
              <div key={k} style={{ position: "absolute", left: i * pitch + (pitch - 10 * coinPx) / 2, top: chartH - coinPx * 4 - level * step }}>
                <Sprite rows={COIN_STACKED} palette={GOLD} px={coinPx} />
              </div>
            );
          })}
          {i === highlight ? (
            <div style={{ position: "absolute", left: i * pitch + (pitch - 11 * coinPx) / 2, top: chartH - coinPx * 4 - c.count * step - 8 * coinPx - 6 }}>
              <Sprite rows={CROWN} palette={GOLD} px={coinPx} />
            </div>
          ) : null}
          <div
            style={{
              position: "absolute",
              left: i * pitch,
              width: pitch,
              top: chartH + 8,
              textAlign: "center",
              ...display(16, i === highlight ? color.gold : c.count > 0 ? color.ink : color.cardMuted),
            }}
          >
            {c.label}
          </div>
        </Fragment>
      ))}
    </div>
  );
};

const organizerPanels = (d: OperatorData): PanelSpec[] => {
  const record = d.biggest[0];
  const series = d.series[0];
  const panels: (PanelSpec | null)[] = [
    d.games.length > 0
      ? {
          key: "games",
          render: ({ width, height }) => {
            const top = d.games.slice(0, 3);
            const coverH = height - 130;
            const coverW = Math.round((coverH * 3) / 4);
            return (
              <Panel label="Games run · events" tone={color.gold} width={width} height={height}>
                <div style={{ position: "absolute", left: 22, top: 58, display: "flex", gap: 12 }}>
                  {top.map((g, i) => (
                    <div key={g.videogameId} style={{ width: coverW }}>
                      <div style={{ width: coverW, height: coverH, backgroundColor: "#050606", border: `3px solid ${i === 0 ? color.gold : color.casingDeep}`, overflow: "hidden", display: "flex", justifyContent: "center" }}>
                        <PixelImage src={g.imageUrl} rows={Math.floor(coverH / 3)} maxCols={Math.floor(coverW / 3)} px={3} mode="art" levels={6} />
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <PixelText text={String(g.count)} px={4} fill={i === 0 ? color.gold : color.ink} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ position: "absolute", right: 22, bottom: 22, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                  <PixelText text={String(d.games.length)} px={9} fill={color.ink} />
                  <div style={{ ...caption, fontSize: 22 }}>{d.games.length === 1 ? "game" : "games"}</div>
                </div>
              </Panel>
            );
          },
        }
      : null,
    record
      ? {
          key: "crowd",
          render: ({ width, height }) => {
            const side = Math.min(130, height - 130);
            return (
              <Panel label="Record crowd" tone={color.gold} width={width} height={height}>
                <div style={{ position: "absolute", left: 22, top: 60, display: "flex", alignItems: "center", gap: 22 }}>
                  <Logo src={record.tournamentImageUrl} side={side} />
                  <div>
                    <PixelText text={String(record.attendees)} px={9} fill={color.gold} />
                    <div style={{ ...caption, fontSize: 22, marginTop: 10 }}>attendees</div>
                  </div>
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 22,
                    right: 22,
                    bottom: 22,
                    fontFamily: font.text,
                    fontWeight: 800,
                    fontSize: 28,
                    color: color.ink,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {record.tournamentName}
                </div>
              </Panel>
            );
          },
        }
      : null,
    series
      ? {
          key: "series",
          render: ({ width, height }) => {
            const side = Math.min(110, height - 140);
            const ticketPx = 2;
            const ticketW = 12 * ticketPx + 4;
            const cols = Math.floor((width - 44) / ticketW);
            const shown = Math.min(series.count, cols * 2);
            return (
              <Panel label="Your series · editions" tone={color.gold} width={width} height={height}>
                <div style={{ position: "absolute", left: 22, top: 58, display: "flex", alignItems: "center", gap: 20 }}>
                  <Logo src={series.imageUrl} side={side} />
                  <div>
                    <div style={display(fitDisplay(displayCase(series.name), 32, width - side - 80))}>{displayCase(series.name)}</div>
                    <div style={{ marginTop: 12 }}>
                      <PixelText text={String(series.count)} px={7} fill={color.gold} />
                    </div>
                  </div>
                </div>
                <div style={{ position: "absolute", left: 22, bottom: 22 }}>
                  {Array.from({ length: shown }, (_, i) => (
                    <div key={i} style={{ position: "absolute", left: (i % cols) * ticketW, bottom: Math.floor(i / cols) * (7 * ticketPx + 4) }}>
                      <Sprite rows={TICKET} palette={TICKET_PALETTE} px={ticketPx} />
                    </div>
                  ))}
                </div>
              </Panel>
            );
          },
        }
      : null,
    d.events.total > 0
      ? {
          key: "events",
          render: ({ width, height }) => {
            return (
              <Panel label="Brackets run this season" width={width} height={height}>
                <div style={{ position: "absolute", left: 22, top: 62 }}>
                  <StillFigure value={String(d.events.total)} px={height < 260 ? 7 : 10} unit="events" />
                </div>
                <div style={{ position: "absolute", left: 22, right: 22, bottom: 64, height: 26, display: "flex", border: `4px solid ${color.casingDeep}` }}>
                  <div style={{ width: `${(d.events.singles / d.events.total) * 100}%`, backgroundColor: color.ink }} />
                  <div style={{ width: `${(d.events.teams / d.events.total) * 100}%`, backgroundColor: color.gold }} />
                </div>
                <div style={{ position: "absolute", left: 22, right: 22, bottom: 20, display: "flex", justifyContent: "space-between" }}>
                  <StillFigure value={String(d.events.singles)} px={4} unit="singles" />
                  <StillFigure value={String(d.events.teams)} px={4} unit="teams" fill={color.gold} />
                </div>
              </Panel>
            );
          },
        }
      : null,
    d.busiestDay
      ? {
          key: "day",
          render: ({ width, height }) => (
            <Panel label="Busiest day" width={width} height={height}>
              <div style={{ position: "absolute", left: 22, top: 54, ...display(32, color.gold) }}>
                {dayName(d.busiestDay!.day)} · {d.busiestDay!.count}
              </div>
              <div style={{ position: "absolute", left: 22, top: 96 }}>
                <CoinChart
                  columns={d.days.map((x) => ({ label: x.day.slice(0, 3).toUpperCase(), count: x.count }))}
                  width={width - 56}
                  height={height - 120}
                  highlight={d.days.indexOf(d.busiestDay!)}
                />
              </div>
            </Panel>
          ),
        }
      : null,
    d.busiestMonth
      ? {
          key: "month",
          render: ({ width, height }) => (
            <Panel label="Busiest month" width={width} height={height}>
              <div style={{ position: "absolute", left: 22, top: 54, ...display(32, color.gold) }}>
                {MONTH_NAMES[d.busiestMonth!.month] ?? d.busiestMonth!.month.toUpperCase()} · {d.busiestMonth!.count}
              </div>
              <div style={{ position: "absolute", left: 22, top: 96 }}>
                <CoinChart
                  columns={d.months.map((x) => ({ label: x.month.slice(0, 1).toUpperCase(), count: x.count }))}
                  width={width - 56}
                  height={height - 120}
                  highlight={d.months.indexOf(d.busiestMonth!)}
                />
              </div>
            </Panel>
          ),
        }
      : null,
  ];
  return panels.filter((p): p is PanelSpec => p !== null);
};

const OrganizerArcadeStill: React.FC<TournamentOrganizerRecapProps & { format: StillFormatKey }> = ({ format, ...recap }) => {
  const d = deriveOperator(recap);
  return (
    <StillPage
      format={format}
      height={STILL_FORMATS[format].height}
      header={{
        avatarUrl: d.avatarUrl,
        slot: "TO",
        role: "TOURNAMENT ORGANISER",
        prefix: null,
        tag: d.tag,
        subtitle: `SEASON 2026 · ${d.totalTournaments} TOURNAMENTS RUN · ${d.events.total} EVENTS`,
      }}
      panels={organizerPanels(d)}
    />
  );
};

export const ORGANIZER_ARCADE_STILL_COMPONENTS = Object.fromEntries(
  STILL_FORMAT_KEYS.map((key) => {
    const Component: React.FC<TournamentOrganizerRecapProps> = (recap) => <OrganizerArcadeStill {...recap} format={key} />;
    return [key, Component];
  }),
) as Record<StillFormatKey, React.FC<TournamentOrganizerRecapProps>>;

export const organizerArcadeStillId = (key: StillFormatKey) => `ArcadeOrganizerStill-${stillIdSuffix(key)}`;

export const OrganizerArcadeStills: React.FC = () => (
  <>
    {STILL_FORMAT_KEYS.map((key) => (
      <Still
        key={key}
        id={organizerArcadeStillId(key)}
        component={ORGANIZER_ARCADE_STILL_COMPONENTS[key]}
        width={STILL_FORMATS[key].width}
        height={STILL_FORMATS[key].height}
        defaultProps={licaneTournamentOrganiserRecap}
      />
    ))}
  </>
);
