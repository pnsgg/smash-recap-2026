import { interpolate } from "remotion";
import { clamp } from "../../../lib/motion";
import type { ActProps } from "../../PlayerRecapArcade";
import type { ArcadeData } from "../data";
import { Bevel, snap } from "../components/kit";
import { PixelText, Sprite } from "../components/Pixel";
import { STAGE_COLS, tileMood, type StageMood } from "../components/Stage";
import { StageView } from "../components/StageView";
import { CASING, HAND } from "../components/sprites";
import { caption, color, display, displayCase, fitDisplay, percent } from "../theme";
import { STAGE_VIEW_AT } from "../timing";

type StageRow = ArcadeData["stages"][number];

const TILE = { w: 128, gap: 10, cols: 4, rows: 3, x: 29, y: 92 } as const;
const TILE_H = Math.round((TILE.w * 80) / STAGE_COLS);
const TILE_BOX = TILE_H + 34;
const WHIP = 8;
const SCREEN = { y: -20, w: 600 } as const;

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

  // A recap with no stages skips this act (timing.ts).
  if (!topStage) return null;

  const views: View[] = [
    { kind: "top", stage: topStage, mood: tileMood(topStage.stageId), label: "Most played stage" },
    ...(bestStage ? [{ kind: "best" as const, stage: bestStage, mood: "gold" as const, label: "Best win rate" }] : []),
    ...(worstStage ? [{ kind: "worst" as const, stage: worstStage, mood: "storm" as const, label: "Lowest win rate" }] : []),
  ];
  const shown = stages.slice(0, TILE.cols * TILE.rows);
  const more = stages.length - shown.length;

  if (t < STAGE_VIEW_AT[0]) {
    // Zoom from the first tile to full screen over the last beat of the grid: the full-size picture, scaled
    // down to the tile and back up as one block with its red frame, so the two always move together.
    const zoom = interpolate(t, [STAGE_VIEW_AT[0] - 10, STAGE_VIEW_AT[0]], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
    const scale = TILE.w / SCREEN.w + (1 - TILE.w / SCREEN.w) * zoom;
    return (
      <>
        <div style={{ position: "absolute", left: 40, top: 40, display: "flex", gap: 12, alignItems: "center", opacity: snap(t, 0) }}>
          <div style={display(32)}>YOUR STAGES</div>
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

  const progress = STAGE_VIEW_AT.slice(1, views.length).reduce(
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
            <FullView view={view} t={t - STAGE_VIEW_AT[i]!} />
          </div>
        );
      })}
    </>
  );
};
