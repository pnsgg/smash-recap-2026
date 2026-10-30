import { interpolate, spring } from "remotion";
import { clamp, springPresets } from "../../../lib/motion";
import type { ActProps } from "../../PlayerRecapArcade";
import type { ArcadeData } from "../data";
import { Bevel, snap } from "../components/kit";
import { PixelText, Sprite } from "../components/Pixel";
import { FEET, STAGE_COLS, tileMood, type StageMood } from "../components/Stage";
import { stageFloor, StageView } from "../components/StageView";
import { CASING, CROWN, cycle, GOLD, HAND, STORM, STORM_PALETTE } from "../components/sprites";
import { caption, color, display, displayCase, fitDisplay, percent } from "../theme";
import { FPS } from "../timing";

type StageRow = ArcadeData["stages"][number];

const TILE = { w: 128, gap: 10, cols: 4, rows: 3, x: 29, y: 92 } as const;
const TILE_H = Math.round((TILE.w * 80) / STAGE_COLS);
const TILE_BOX = TILE_H + 34;
const VIEW_AT = [60, 145, 220] as const;
const WHIP = 8;
const SCREEN = { y: -20, w: 600 } as const;
const UNIT = SCREEN.w / STAGE_COLS;
const SCREEN_H = (SCREEN.w * 80) / STAGE_COLS;

type View = { kind: "top" | "best" | "worst"; stage: StageRow; mood: StageMood; label: string };

const Tile: React.FC<{ stage: StageRow; i: number; t: number; lit: boolean }> = ({ stage, i, t, lit }) => (
  <Bevel
    width={TILE.w + 8}
    height={TILE_BOX}
    fill={color.raised2}
    style={{
      left: TILE.x + (i % TILE.cols) * (TILE.w + TILE.gap) - 4,
      top: TILE.y + Math.floor(i / TILE.cols) * (TILE_BOX + TILE.gap),
      transform: `scale(${snap(t, 4 + i * 3)})`,
      outline: lit ? `4px solid ${color.accent}` : undefined,
      outlineOffset: -2,
    }}
  >
    <div style={{ position: "absolute", left: 4, top: 4 }}>
      <StageView stage={stage} width={TILE.w} mood={tileMood(stage.stageId)} frame={t} />
    </div>
    <div style={{ position: "absolute", left: 10, top: TILE_H + 12, display: "flex", gap: 6, alignItems: "flex-end" }}>
      <PixelText text={String(stage.count)} px={2} fill={color.ink} />
      <div style={{ ...caption, fontSize: 12, lineHeight: 1 }}>games</div>
    </div>
  </Bevel>
);

const Prop: React.FC<{ view: View; t: number }> = ({ view, t }) => {
  const bob = Math.floor(t / 10) % 2 === 0 ? 0 : -UNIT;
  if (view.kind === "best") {
    return <Sprite rows={CROWN} palette={GOLD} px={5} style={{ transform: `translateY(${bob}px)` }} />;
  }
  if (view.kind === "worst") {
    return <Sprite rows={cycle(STORM, t, 4)} palette={STORM_PALETTE} px={5} style={{ transform: `translateY(${bob}px)` }} />;
  }
  return null;
};

const FullView: React.FC<{ view: View; t: number }> = ({ view, t }) => {
  const { stage, mood } = view;
  const lead = view.kind === "top" ? "games" : "rate";
  const name = displayCase(stage.stageName);
  const accent = mood === "gold" ? color.gold : mood === "storm" ? color.accent : color.ink;
  const games = (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
      <PixelText text={String(stage.count)} px={lead === "games" ? 6 : 4} fill={lead === "games" ? color.ink : color.muted} />
      <div style={{ ...caption, lineHeight: 1 }}>games</div>
    </div>
  );
  const rate = (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
      <PixelText text={percent(stage.winRate)} px={lead === "rate" ? 6 : 4} fill={lead === "rate" ? accent : color.muted} />
      <div style={{ ...caption, lineHeight: 1 }}>won</div>
    </div>
  );
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: SCREEN.y }}>
        <StageView stage={stage} width={SCREEN.w} mood={mood} frame={t} />
      </div>
      {/* What the stage meant, dropping in to hover over its floor: a crown for the best, a storm for the worst */}
      <div
        style={{
          position: "absolute",
          left: FEET.x * UNIT - 100,
          width: 200,
          top: SCREEN.y + stageFloor(stage.stageId) * SCREEN_H - 160,
          height: 100,
          transform: `translateY(${interpolate(spring({ frame: t - 2, fps: FPS, config: springPresets.bouncy }), [0, 1], [-300, 0])}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 10,
        }}
      >
        <Prop view={view} t={t} />
      </div>
      <div style={{ position: "absolute", left: 44, right: 44, top: 396 }}>
        <div style={{ ...caption, fontSize: 18, color: accent }}>{view.label}</div>
        <div style={{ ...display(fitDisplay(name, 48, 520)), marginTop: 10 }}>{name}</div>
        <div style={{ display: "flex", gap: 28, alignItems: "flex-end", marginTop: 16 }}>
          {lead === "games" ? games : rate}
          {lead === "games" ? rate : games}
        </div>
      </div>
    </>
  );
};

export const StageSelect: React.FC<ActProps> = ({ t, data }) => {
  const { stages, topStage, bestStage, worstStage } = data;

  if (!topStage) {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <div style={display(32)}>STAGE SELECT</div>
        <div style={{ ...caption, fontSize: 18 }}>No stage data reported</div>
      </div>
    );
  }

  const views: View[] = [
    { kind: "top", stage: topStage, mood: tileMood(topStage.stageId), label: "Most played stage" },
    ...(bestStage ? [{ kind: "best" as const, stage: bestStage, mood: "gold" as const, label: "Best win rate · 10+ games" }] : []),
    ...(worstStage ? [{ kind: "worst" as const, stage: worstStage, mood: "storm" as const, label: "Lowest win rate · 10+ games" }] : []),
  ];
  const shown = stages.slice(0, TILE.cols * TILE.rows);
  const more = stages.length - shown.length;

  if (t < VIEW_AT[0]) {
    // Zoom from the first tile to full screen over the last beat of the grid: the full-size picture, scaled
    // down to the tile and back up as one block with its red frame, so the two always move together.
    const zoom = interpolate(t, [VIEW_AT[0] - 10, VIEW_AT[0]], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
    const scale = TILE.w / SCREEN.w + (1 - TILE.w / SCREEN.w) * zoom;
    return (
      <>
        <div style={{ position: "absolute", left: 40, top: 40, display: "flex", gap: 12, alignItems: "center", opacity: snap(t, 0) }}>
          <div style={display(32)}>STAGE SELECT</div>
        </div>
        {shown.map((stage, i) => (
          <Tile key={stage.stageId} stage={stage} i={i} t={t} lit={i === 0 && t >= 36} />
        ))}
        {more > 0 ? (
          <div style={{ position: "absolute", left: 40, top: 520, ...caption, fontSize: 18, opacity: snap(t, 30) }}>
            +{more} more {more === 1 ? "stage" : "stages"}
          </div>
        ) : null}
        <div
          style={{
            position: "absolute",
            left: TILE.x + TILE.w - 30,
            top: TILE.y + TILE_H - 10 + interpolate(snap(t, 26), [0, 1], [200, 0]),
            opacity: snap(t, 26),
          }}
        >
          <Sprite rows={HAND} palette={CASING} px={3} />
        </div>
        <div
          style={{
            position: "absolute",
            left: TILE.x * (1 - zoom),
            top: TILE.y + 4 + (SCREEN.y - TILE.y - 4) * zoom,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            outline: `${4 / scale}px solid ${color.accent}`,
            opacity: zoom > 0 ? 1 : 0,
          }}
        >
          <StageView stage={topStage} width={SCREEN.w} mood={tileMood(topStage.stageId)} frame={t} />
        </div>
        {/* Off screen: the other stages get drawn while the grid is up, so nothing pops in later */}
        <div style={{ position: "absolute", left: -2000, top: 0 }}>
          {views.slice(1).map((view) => (
            <StageView key={view.kind} stage={view.stage} width={SCREEN.w} mood={view.mood} frame={t} />
          ))}
        </div>
      </>
    );
  }

  const progress = VIEW_AT.slice(1, views.length).reduce(
    (sum, at) => sum + interpolate(t, [at - WHIP, at], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) }),
    0,
  );
  const whipping = progress % 1 !== 0;

  return (
    <>
      {views.map((view, i) => {
        const x = (i - progress) * 600;
        return (
          <div key={i} style={{ position: "absolute", inset: 0, transform: `translateX(${x}px)`, filter: whipping ? "blur(3px)" : undefined }}>
            <FullView view={view} t={t - VIEW_AT[i]!} />
          </div>
        );
      })}
    </>
  );
};
