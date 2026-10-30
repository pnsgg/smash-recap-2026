import { interpolate } from "remotion";
import { clamp } from "../../../lib/motion";
import { Bevel, rollUp, snap } from "../../PlayerRecapArcade/components/kit";
import { PixelImage } from "../../PlayerRecapArcade/components/PixelImage";
import { PixelText } from "../../PlayerRecapArcade/components/Pixel";
import { Slam } from "../../PlayerRecapArcade/components/Slam";
import { caption, color, display, displayCase, fitDisplay } from "../../PlayerRecapArcade/theme";
import type { OperatorData } from "../data";

type Game = OperatorData["games"][number];

const ALL_AT = 110;
const EVENTS_AT = 210;
const GRID = { cols: 6, rows: 3, w: 84, h: 132, gap: 6 } as const;

const NameScreen: React.FC<{ name: string; width: number; height: number; size: number }> = ({ name, width, height, size }) => (
  <div
    style={{
      width,
      height,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      ...display(size, color.muted),
      whiteSpace: "normal",
      backgroundColor: color.raised,
    }}
  >
    {displayCase(name)}
  </div>
);

const Cabinet: React.FC<{ game: Game; t: number; at: number; rank: number }> = ({ game, t, at, rank }) => {
  const enter = snap(t, at);
  const name = displayCase(game.videogameName);
  return (
    <div style={{ width: 172, transform: `translateY(${interpolate(enter, [0, 1], [300, 0])}px)`, opacity: enter > 0 ? 1 : 0 }}>
      <Bevel width={172} height={300} fill={color.casing} light="#f2f0ea" dark={color.casingDeep} edge={5} style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 10,
            right: 10,
            top: 10,
            height: 46,
            backgroundColor: rank === 0 ? color.accent : color.accentEdge,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 6px",
            ...display(16, rank === 0 ? color.ground : color.ink),
            whiteSpace: "normal",
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          {name}
        </div>
        <div
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            top: 66,
            height: 200,
            backgroundColor: "#050606",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <PixelImage
            src={game.imageUrl}
            rows={96}
            maxCols={68}
            px={2}
            mode="art"
            levels={6}
            fallback={<NameScreen name={game.videogameName} width={144} height={200} size={16} />}
          />
        </div>
        <div style={{ position: "absolute", left: 30, top: 274, width: 14, height: 14, borderRadius: 7, backgroundColor: color.accent }} />
        <div style={{ position: "absolute", left: 52, top: 274, width: 14, height: 14, borderRadius: 7, backgroundColor: color.gold }} />
      </Bevel>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginTop: 16 }}>
        <PixelText text={String(rollUp(game.count, t, at + 6))} px={5} fill={rank === 0 ? color.gold : color.ink} />
        <div style={{ ...caption, lineHeight: 1 }}>events</div>
      </div>
    </div>
  );
};

const Others: React.FC<{ t: number; games: Game[]; total: number }> = ({ t, games, total }) => {
  const slots = GRID.cols * GRID.rows;
  const shown = games.length > slots ? games.slice(0, slots - 1) : games;
  const more = games.length - shown.length;
  return (
    <>
      <div style={{ position: "absolute", left: 44, top: 40, display: "flex", alignItems: "flex-end", gap: 14 }}>
        <PixelText text={String(rollUp(total, t, 0, 30))} px={8} fill={color.gold} />
        <div style={{ ...display(32), marginBottom: -2 }}>{total === 1 ? "GAME" : "GAMES"}</div>
      </div>
      <div style={{ ...caption, position: "absolute", left: 44, top: 108, opacity: snap(t, 6) }}>Every game you ran events for</div>
      <div
        style={{
          position: "absolute",
          left: 300 - (GRID.cols * GRID.w + (GRID.cols - 1) * GRID.gap) / 2,
          top: 146,
          display: "grid",
          gridTemplateColumns: `repeat(${GRID.cols}, ${GRID.w}px)`,
          gap: GRID.gap,
        }}
      >
        {shown.map((g, i) => (
          <div key={g.videogameId} style={{ height: GRID.h, transform: `scale(${snap(t, 4 + i * 2)})` }}>
            <div style={{ height: 104, backgroundColor: "#050606", outline: `3px solid ${color.casingDeep}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <PixelImage
                src={g.imageUrl}
                rows={52}
                maxCols={42}
                px={2}
                mode="art"
                levels={6}
                fallback={<NameScreen name={g.videogameName} width={GRID.w} height={104} size={16} />}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
              <PixelText text={String(g.count)} px={3} fill={color.ink} />
            </div>
          </div>
        ))}
        {more > 0 ? (
          <div style={{ height: 104, display: "flex", alignItems: "center", justifyContent: "center", ...display(16, color.muted), backgroundColor: color.raised }}>+{more}</div>
        ) : null}
      </div>
    </>
  );
};

const Events: React.FC<{ t: number; events: OperatorData["events"] }> = ({ t, events }) => {
  const grow = interpolate(t, [10, 34], [0, 1], clamp);
  const share = events.total > 0 ? events.singles / events.total : 0;
  return (
    <div style={{ position: "absolute", left: 44, right: 44, top: 150 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
        <PixelText text={String(rollUp(events.total, t, 0, 24))} px={14} fill={color.ink} />
        <Slam frame={t} at={4} text="EVENTS" style={display(48, color.gold)} fill={color.gold} />
      </div>
      <div style={{ ...caption, fontSize: 18, marginTop: 16 }}>Brackets you ran this season</div>
      <div style={{ display: "flex", height: 34, marginTop: 30, outline: `4px solid ${color.casingDeep}`, backgroundColor: color.raised }}>
        <div style={{ width: `${share * grow * 100}%`, backgroundColor: color.ink }} />
        <div style={{ width: `${(1 - share) * grow * 100}%`, backgroundColor: color.gold }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, opacity: snap(t, 30) }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <PixelText text={String(events.singles)} px={5} fill={color.ink} />
          <div style={{ ...caption, lineHeight: 1 }}>singles</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <PixelText text={String(events.teams)} px={5} fill={color.gold} />
          <div style={{ ...caption, lineHeight: 1 }}>teams</div>
        </div>
      </div>
    </div>
  );
};

export const GamesInstalled: React.FC<{ t: number; data: OperatorData }> = ({ t, data }) => {
  const top = data.games.slice(0, 3);
  const rest = data.games.slice(3);
  if (t >= EVENTS_AT || (t >= ALL_AT && rest.length === 0)) return <Events t={t - (rest.length ? EVENTS_AT : ALL_AT)} events={data.events} />;
  if (t >= ALL_AT) return <Others t={t - ALL_AT} games={rest} total={data.games.length} />;
  if (top.length === 0) {
    return <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...caption, fontSize: 18 }}>No games reported</div>;
  }
  const title = "GAMES INSTALLED";
  return (
    <>
      <div style={{ position: "absolute", left: 44, top: 40 }}>
        <Slam frame={t} at={0} text={title} style={display(fitDisplay(title, 48, 512), color.gold)} fill={color.gold} />
        <div style={{ ...caption, marginTop: 12, opacity: snap(t, 6) }}>Most events run, by game</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 128, display: "flex", justifyContent: "center", gap: 14 }}>
        {top.map((g, i) => (
          <Cabinet key={g.videogameId} game={g} t={t} at={8 + i * 10} rank={i} />
        ))}
      </div>
    </>
  );
};
