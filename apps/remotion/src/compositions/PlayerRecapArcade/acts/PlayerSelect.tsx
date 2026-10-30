import { interpolate } from "remotion";
import { clamp } from "../../../lib/motion";
import type { ActProps } from "../../PlayerRecapArcade";
import type { ArcadeData } from "../data";
import { Bevel, Chip, rollUp, snap, SpeedLines } from "../components/kit";
import { PixelImage } from "../components/PixelImage";
import { PixelText, Sprite } from "../components/Pixel";
import { Slam } from "../components/Slam";
import { CASING, HAND, LOCK, LOCK_PALETTE } from "../components/sprites";
import { blink, caption, color, display, displayCase, fitDisplay } from "../theme";

type Fighter = ArcadeData["fighters"][number];

const GRID = { x: 322, y: 100, cols: 3, rows: 4, tile: 78, gap: 8 } as const;
const PANEL = { x: 22, y: 84, w: 284, h: 470 } as const;
export const PICKS = [50, 140] as const;
export const ALSO = 210;

const tilePos = (i: number) => ({
  x: GRID.x + (i % GRID.cols) * (GRID.tile + GRID.gap),
  y: GRID.y + Math.floor(i / GRID.cols) * (GRID.tile + GRID.gap),
});

const NameTile: React.FC<{ name: string; size: number }> = ({ name, size }) => (
  <div
    style={{
      width: size,
      height: size,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...display(16, color.ink),
      whiteSpace: "normal",
      textAlign: "center",
    }}
  >
    {displayCase(name).slice(0, 8)}
  </div>
);

const Portrait: React.FC<{ fighter: Fighter; t: number; at: number }> = ({ fighter, t, at }) => {
  const enter = snap(t - at, 0);
  const name = displayCase(fighter.characterName);
  const breathe = Math.floor((t - at) / 15) % 2 === 0 ? 0 : 4;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 104,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          transform: `translate(${Math.round(interpolate(enter, [0, 1], [-160, 0]) / 4) * 4}px, ${breathe}px)`,
          opacity: enter > 0 ? 1 : 0,
        }}
      >
        <PixelImage
          src={fighter.renderUrl}
          rows={80}
          maxCols={62}
          px={4}
          fallback={<NameTile name={fighter.characterName} size={240} />}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: -12,
          right: 18,
          bottom: 22,
          height: 84,
          backgroundColor: color.accent,
          boxShadow: `0 6px 0 ${color.accentEdge}`,
          transform: `skewX(-10deg) translateX(${interpolate(snap(t - at, 6), [0, 1], [-300, 0])}px)`,
        }}
      />
      <div style={{ position: "absolute", left: 18, bottom: 64, transform: `translateX(${interpolate(snap(t - at, 6), [0, 1], [-300, 0])}px)` }}>
        <div style={display(fitDisplay(name, 32, 250), color.ground)}>{name}</div>
      </div>
      <div style={{ position: "absolute", left: 18, bottom: 32, display: "flex", gap: 10, alignItems: "flex-end", opacity: snap(t - at, 10) }}>
        <PixelText text={String(rollUp(fighter.count, t, at + 10))} px={3} fill={color.ground} />
        <div style={{ ...caption, color: color.ground, lineHeight: 1 }}>games</div>
      </div>
    </>
  );
};

export const PlayerSelect: React.FC<ActProps> = ({ t, data }) => {
  const { fighters } = data;
  const pick = fighters.length > 1 && t >= PICKS[1] ? 1 : 0;
  const listing = t >= ALSO && fighters.length > 2;
  // The cursor slides up onto the first pick, then hops to the second.
  const first = tilePos(0);
  const second = tilePos(fighters.length > 1 ? 1 : 0);
  const arrive = interpolate(t, [30, PICKS[0]], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const hop = interpolate(t, [PICKS[1], PICKS[1] + 8], [0, 1], clamp);
  const cursor = {
    x: first.x + (second.x - first.x) * hop,
    y: first.y + (1 - arrive) * 140 + (second.y - first.y) * hop - Math.sin(hop * Math.PI) * 24,
  };
  const cursorIn = snap(t, 30);
  const ready = t >= ALSO + 24;

  return (
    <>
      {/* The pick, big */}
      <Bevel width={PANEL.w} height={PANEL.h} fill={color.raised} style={{ left: PANEL.x, top: PANEL.y }}>
        <SpeedLines t={t} width={PANEL.w + 200} height={PANEL.h} />
        {!listing && fighters[pick] ? <Portrait key={pick} fighter={fighters[pick]!} t={t} at={PICKS[pick]!} /> : null}
        {!listing && t < PICKS[0] ? (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...display(64, color.raised2) }}>?</div>
        ) : null}
        {listing ? (
          <div style={{ position: "absolute", left: 22, top: 26 }}>
            <div style={{ ...caption, fontSize: 18, opacity: snap(t, ALSO) }}>Also picked</div>
            {fighters.slice(2).map((f, i) => (
              <div
                key={f.characterId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginTop: 22,
                  transform: `translateX(${interpolate(snap(t, ALSO + 4 + i * 6), [0, 1], [-300, 0])}px)`,
                }}
              >
                <Bevel width={88} height={88} fill={color.raised2} style={{ position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PixelImage src={f.stockIconUrl} rows={18} px={4} fallback={<NameTile name={f.characterName} size={80} />} />
                  </div>
                </Bevel>
                <div>
                  <div style={display(fitDisplay(displayCase(f.characterName), 32, 150))}>{displayCase(f.characterName)}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginTop: 10 }}>
                    <PixelText text={String(f.count)} px={3} fill={color.gold} />
                    <div style={{ ...caption, lineHeight: 1 }}>games</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Bevel>

      {/* The select screen */}
      <div style={{ position: "absolute", left: GRID.x, top: 42, display: "flex", alignItems: "center", gap: 12, opacity: snap(t, 0) }}>
        <div style={display(32)}>SELECT</div>
        <Chip text="1P" />
      </div>
      {Array.from({ length: GRID.cols * GRID.rows }, (_, i) => {
        const f = fighters[i];
        const pos = tilePos(i);
        const flip = snap(t, 6 + i * 3);
        const chosen = f !== undefined && t >= PICKS[0] && (i === pick || (listing && i < fighters.length));
        const lit = chosen && (t - PICKS[Math.min(i, 1)]! > 12 || blink(t * 2));
        return (
          <Bevel
            key={i}
            width={GRID.tile}
            height={GRID.tile}
            fill={f ? color.raised2 : color.raised}
            style={{
              left: pos.x,
              top: pos.y,
              transform: `scaleY(${flip})`,
              outline: lit ? `4px solid ${color.accent}` : undefined,
              outlineOffset: -2,
            }}
          >
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {f ? (
                <PixelImage src={f.stockIconUrl} rows={16} px={4} fallback={<NameTile name={f.characterName} size={70} />} />
              ) : (
                <Sprite rows={LOCK} palette={LOCK_PALETTE} px={4} />
              )}
            </div>
            {f ? (
              <div style={{ position: "absolute", left: 6, top: 6 }}>
                <PixelText text={String(i + 1)} px={2} fill={i === 0 ? color.gold : color.muted} />
              </div>
            ) : null}
          </Bevel>
        );
      })}

      {/* The P1 cursor */}
      <div
        style={{
          position: "absolute",
          left: cursor.x + GRID.tile - 26,
          top: cursor.y + GRID.tile - 22,
          opacity: cursorIn,
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
        }}
      >
        <Sprite rows={HAND} palette={CASING} px={3} />
        <Chip text="1P" size={16} style={{ marginTop: 22 }} />
      </div>

      <div style={{ position: "absolute", left: GRID.x, top: 452, width: 250 }}>
        <div style={{ ...caption, opacity: snap(t, 20) }}>Most played fighters</div>
        <div style={{ ...caption, color: color.ink, marginTop: 4, opacity: snap(t, 24) }}>by games</div>
        <div style={{ marginTop: 18, height: 32 }}>{ready ? <Slam frame={t} at={ALSO + 24} text="P1 READY" style={display(32, color.gold)} /> : null}</div>
      </div>
    </>
  );
};
