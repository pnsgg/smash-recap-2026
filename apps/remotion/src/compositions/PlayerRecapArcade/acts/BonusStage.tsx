import { interpolate, spring } from "remotion";
import { clamp, springPresets } from "../../../lib/motion";
import type { ActProps } from "../../PlayerRecapArcade";
import type { ArcadeData } from "../data";
import { snap, Stripes } from "../components/kit";
import { PixelImage } from "../components/PixelImage";
import { PixelText, Sprite } from "../components/Pixel";
import { Slam } from "../components/Slam";
import { BOOM, BOOM_PALETTE, CHEST, CHEST_PALETTE, cycle } from "../components/sprites";
import { FPS } from "../timing";
import { caption, color, display, displayCase, fitDisplay, font, uncapped } from "../theme";

const RUNS_AT = 40;
const UPSET_AT = 225;

const Bricks: React.FC = () => (
  <svg width={600} height={600} shapeRendering="crispEdges" style={{ position: "absolute", inset: 0, ...uncapped }}>
    <defs>
      <pattern id="arcade-bricks" width={64} height={32} patternUnits="userSpaceOnUse">
        <rect width={64} height={32} fill="#070908" />
        {[
          [0, 0],
          [-32, 16],
          [32, 16],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width={60} height={12} fill="#2a1d15" />
            <rect x={x} y={y} width={60} height={2} fill="#3b2a1e" />
          </g>
        ))}
      </pattern>
    </defs>
    <rect width={600} height={600} fill="url(#arcade-bricks)" />
  </svg>
);

type RunEntry = { name: string; src: string | null; spr: number; worst: boolean };

// Each run is a ladder from the seed line: one rung per placement round above seed, down for the worst run.
const SEED_Y = 392;
const AREA = { left: 40, width: 520, up: 240, down: 104 } as const;
const BUILD_AT = 16;
const BUILD_EACH = 20;
const LOGO = 52;

const signed = (spr: number) => (spr > 0 ? `+${spr}` : String(spr));

const Logo: React.FC<{ src: string | null; side: number; edge: string }> = ({ src, side, edge }) => (
  <div style={{ width: side, height: side, outline: `4px solid ${edge}`, backgroundColor: color.raised2 }}>
    <PixelImage src={src} rows={side / 4} px={4} mode="photo" levels={5} />
  </div>
);

/** A ladder `rungs` high (or deep), drawn as pixel rails and rungs; `shown` of them built so far. */
const Ladder: React.FC<{ x: number; rungs: number; shown: number; step: number; down: boolean; tone: string; rail: string }> = ({
  x,
  rungs,
  shown,
  step,
  down,
  tone,
  rail,
}) => {
  const height = shown * step;
  return (
    <div style={{ position: "absolute", left: x - 20, top: down ? SEED_Y : SEED_Y - height, width: 40, height }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 6, height, backgroundColor: rail }} />
      <div style={{ position: "absolute", right: 0, top: 0, width: 6, height, backgroundColor: rail }} />
      {Array.from({ length: Math.min(rungs, Math.ceil(shown)) }, (_, k) => (
        <div key={k} style={{ position: "absolute", left: 6, right: 6, top: down ? (k + 0.5) * step - 3 : height - (k + 0.5) * step - 3, height: 6, backgroundColor: tone }} />
      ))}
    </div>
  );
};

const Runs: React.FC<{ t: number; data: ArcadeData }> = ({ t, data }) => {
  const runs: RunEntry[] = [
    ...data.bestRuns.map((r) => ({ name: r.tournamentName, src: r.tournamentImageUrl, spr: r.spr, worst: false })),
    ...(data.worstRun ? [{ name: data.worstRun.tournamentName, src: data.worstRun.tournamentImageUrl, spr: data.worstRun.spr, worst: true }] : []),
  ];
  const pitch = AREA.width / Math.max(1, runs.length);
  const maxUp = Math.max(1, ...runs.map((r) => r.spr));
  const maxDown = Math.max(1, ...runs.map((r) => -r.spr));
  const upStep = Math.min(40, (AREA.up - LOGO - 40) / maxUp);
  const downStep = Math.min(30, (AREA.down - 10) / maxDown);
  const builtAt = (i: number) => BUILD_AT + i * BUILD_EACH;
  const building = runs.findIndex((_, i) => t < builtAt(i) + BUILD_EACH);
  // While the ladders build, the line under them names the one going up; then it settles on the best run.
  const named = building === -1 ? runs.find((r) => !r.worst) ?? runs[0]! : runs[building]!;

  return (
    <>
      <div style={{ position: "absolute", left: 44, top: 40 }}>
        <Slam frame={t} at={0} text="BEST RUNS" style={display(32, color.gold)} fill={color.gold} />
        <div style={{ ...caption, marginTop: 12, opacity: snap(t, 6) }}>Rounds you finished above your seed</div>
      </div>

      {/* The seed line */}
      <div style={{ position: "absolute", left: 24, right: 24, top: SEED_Y - 2, height: 4, opacity: snap(t, 4) }}>
        <Stripes width={552} height={4} angle={0} period={16} band={10} fill={color.muted} />
      </div>
      <div style={{ position: "absolute", left: 26, top: SEED_Y + 10, ...caption, fontSize: 14, opacity: snap(t, 8) }}>Your seed</div>

      {runs.map((r, i) => {
        const x = AREA.left + pitch * (i + 0.5);
        const rungs = Math.abs(r.spr);
        const step = r.worst ? downStep : upStep;
        const shown = interpolate(t, [builtAt(i), builtAt(i) + BUILD_EACH - 4], [0, rungs], { ...clamp, easing: (v) => 1 - (1 - v) ** 2 });
        const end = r.worst ? SEED_Y + shown * step : SEED_Y - shown * step;
        const visible = t >= builtAt(i);
        const done = t >= builtAt(i) + BUILD_EACH - 4;
        const tone = r.worst ? color.accent : color.gold;
        return visible ? (
          <div key={i}>
            <Ladder x={x} rungs={rungs} shown={shown} step={step} down={r.worst} tone={tone} rail={r.worst ? color.accentEdge : color.casingDeep} />
            <div style={{ position: "absolute", left: x - LOGO / 2, top: r.worst ? end + 4 : end - LOGO - 4, opacity: snap(t, builtAt(i)) }}>
              <Logo src={r.src} side={LOGO} edge={r.worst ? color.accent : named === r ? color.gold : color.casingDeep} />
            </div>
            <div
              style={{
                position: "absolute",
                left: r.worst ? x - LOGO / 2 - 78 : x - 40,
                width: r.worst ? 66 : 80,
                top: r.worst ? end + 4 + LOGO / 2 - 14 : end - LOGO - 40,
                display: "flex",
                justifyContent: r.worst ? "flex-end" : "center",
                opacity: done ? 1 : 0,
              }}
            >
              <PixelText text={signed(r.spr)} px={4} fill={tone} />
            </div>
          </div>
        ) : null;
      })}

      {/* Which run this is */}
      {named ? (
        <div style={{ position: "absolute", left: 44, right: 44, top: 520, opacity: snap(t, BUILD_AT) }}>
          <div style={{ ...caption, color: named.worst ? color.accent : color.gold }}>{named.worst ? "Worst run" : building === -1 ? "Best run" : "Climbing"}</div>
          <div style={{ fontFamily: font.text, fontWeight: 800, fontSize: 24, color: color.ink, marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {named.name} · {signed(named.spr)}
          </div>
        </div>
      ) : null}
    </>
  );
};

const Upset: React.FC<{ t: number; data: ArcadeData }> = ({ t, data }) => {
  const upset = data.upset!;
  const name = displayCase(upset.tournamentName);
  return (
    <>
      <div style={{ position: "absolute", left: 300 - 144, top: 120, opacity: t < 12 ? 1 : 0.35 }}>
        <Sprite rows={cycle(BOOM, Math.min(t, 11), 3)} palette={BOOM_PALETTE} px={18} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 44, display: "flex", justifyContent: "center" }}>
        <Slam frame={t} at={0} text="BIGGEST UPSET" style={display(48, color.ink)} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ ...caption, fontSize: 18, color: color.gold, opacity: snap(t, 6) }}>Upset factor</div>
        <div style={{ transform: `scale(${interpolate(spring({ frame: t - 6, fps: FPS, config: springPresets.heavy }), [0, 1], [2, 1])})`, opacity: t >= 6 ? 1 : 0 }}>
          <PixelText text={String(upset.factor)} px={20} fill={color.gold} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 44, right: 44, top: 380, display: "flex", alignItems: "center", gap: 20, opacity: snap(t, 18) }}>
        <div style={{ width: 96, height: 96, flex: "none", outline: `4px solid ${color.casingDeep}`, backgroundColor: color.raised2 }}>
          <PixelImage src={upset.tournamentImageUrl} rows={24} px={4} mode="photo" levels={5} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={display(fitDisplay(name, 32, 380))}>{name}</div>
          <div style={{ ...caption, marginTop: 12, whiteSpace: "normal" }}>{upset.eventName}</div>
        </div>
      </div>
    </>
  );
};

export const BonusStage: React.FC<ActProps> = ({ t, data }) => {
  const hasRuns = data.bestRuns.length > 0 || data.worstRun !== null;
  const upsetAt = data.upset ? (hasRuns ? UPSET_AT : RUNS_AT) : Infinity;
  const card = t < RUNS_AT || (!hasRuns && !data.upset);
  const drop = interpolate(spring({ frame: t - 8, fps: FPS, config: springPresets.bouncy }), [0, 1], [-260, 0]);

  return (
    <>
      <Bricks />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, background: "rgba(11,15,13,0.55)" }} />
      {card ? (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", justifyContent: "center" }}>
            <Slam frame={t} at={2} text="BONUS STAGE" style={display(64, color.gold)} fill={color.gold} />
          </div>
          <div style={{ position: "absolute", left: 300 - 70, top: 300 + drop }}>
            <Sprite rows={CHEST[0]} palette={CHEST_PALETTE} px={10} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 404, height: 6, backgroundColor: color.casingDeep, opacity: interpolate(t, [0, 6], [0, 1], clamp) }} />
          {!hasRuns && !data.upset ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center", ...caption, fontSize: 18 }}>No seeded runs reported</div>
          ) : null}
        </>
      ) : null}
      {t >= RUNS_AT && t < upsetAt && hasRuns ? <Runs t={t - RUNS_AT} data={data} /> : null}
      {t >= upsetAt && data.upset ? <Upset t={t - upsetAt} data={data} /> : null}
    </>
  );
};
