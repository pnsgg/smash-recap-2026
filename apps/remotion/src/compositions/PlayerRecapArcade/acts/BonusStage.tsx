import { interpolate, spring } from "remotion";
import { springPresets } from "../../../lib/motion";
import type { ActProps } from "../../PlayerRecapArcade";
import type { ArcadeData } from "../data";
import { Chip, snap } from "../components/kit";
import { PixelImage } from "../components/PixelImage";
import { PixelText, Sprite } from "../components/Pixel";
import { Slam } from "../components/Slam";
import { BOOM, BOOM_PALETTE, cycle } from "../components/sprites";
import { FPS } from "../timing";
import { caption, color, display, displayCase, fitDisplay, font } from "../theme";

const RUNS_AT = 40;
const UPSET_AT = 280;

// The best run gets the screen to itself, then the other runs and the worst one as a list that stays up.
const LIST_AT = 90;
const ROW = { top: 132, pitch: 66, logo: 52 } as const;

const signed = (spr: number) => (spr > 0 ? `+${spr}` : String(spr));

const Logo: React.FC<{ src: string | null; side: number; edge: string }> = ({ src, side, edge }) => (
  <div style={{ width: side, height: side, flex: "none", outline: `4px solid ${edge}`, backgroundColor: color.raised2 }}>
    <PixelImage src={src} rows={side / 4} px={4} mode="photo" levels={5} />
  </div>
);

type Run = ArcadeData["bestRuns"][number];

const BestRun: React.FC<{ t: number; run: Run }> = ({ t, run }) => {
  const name = displayCase(run.tournamentName);
  return (
    <>
      <div style={{ position: "absolute", left: 44, top: 40 }}>
        <Slam frame={t} at={0} text="BEST RUN" style={display(48, color.gold)} fill={color.gold} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 128,
          display: "flex",
          alignItems: "center",
          gap: 36,
          transform: `translateX(${interpolate(snap(t, 4), [0, 1], [-400, 0])}px)`,
        }}
      >
        <Logo src={run.tournamentImageUrl} side={176} edge={color.gold} />
        <div style={{ transform: `scale(${interpolate(spring({ frame: t - 10, fps: FPS, config: springPresets.heavy }), [0, 1], [2, 1])})`, opacity: t >= 10 ? 1 : 0 }}>
          <PixelText text={signed(run.spr)} px={14} fill={color.gold} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 44, right: 44, top: 350, opacity: snap(t, 14) }}>
        <div style={{ ...display(fitDisplay(name, 48, 512)), whiteSpace: "normal", lineHeight: 1.15 }}>{name}</div>
        <div style={{ ...caption, fontSize: 18, marginTop: 18 }}>Rounds finished above your seed</div>
      </div>
    </>
  );
};

const RunRow: React.FC<{ run: Run; top: number; t: number; at: number; worst?: boolean }> = ({ run, top, t, at, worst = false }) => (
  <div
    style={{
      position: "absolute",
      left: 44,
      right: 44,
      top,
      display: "flex",
      alignItems: "center",
      gap: 20,
      opacity: t >= at ? 1 : 0,
      transform: `translateX(${interpolate(snap(t, at), [0, 1], [-300, 0])}px)`,
    }}
  >
    <Logo src={run.tournamentImageUrl} side={ROW.logo} edge={worst ? color.accent : color.casingDeep} />
    <div style={{ flex: 1, minWidth: 0, fontFamily: font.text, fontWeight: 800, fontSize: 24, color: color.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
      {run.tournamentName}
    </div>
    <PixelText text={signed(run.spr)} px={5} fill={worst ? color.accent : color.gold} />
  </div>
);

const OtherRuns: React.FC<{ t: number; runs: Run[]; worst: Run | null }> = ({ t, runs, worst }) => {
  const rowAt = (i: number) => 6 + i * 6;
  const worstTop = ROW.top + runs.length * ROW.pitch + (runs.length > 0 ? 30 : 0);
  return (
    <>
      <div style={{ position: "absolute", left: 44, top: 40 }}>
        <Slam frame={t} at={0} text={runs.length > 0 ? "MORE RUNS" : "WORST RUN"} style={display(32, runs.length > 0 ? color.gold : color.accent)} fill={runs.length > 0 ? color.gold : color.accent} />
        <div style={{ ...caption, marginTop: 12, opacity: snap(t, 4) }}>Rounds finished above or below your seed</div>
      </div>
      {runs.map((run, i) => (
        <RunRow key={i} run={run} top={ROW.top + i * ROW.pitch} t={t} at={rowAt(i)} />
      ))}
      {worst ? (
        <>
          {runs.length > 0 ? (
            <div style={{ position: "absolute", left: 44, right: 44, top: worstTop - 22, display: "flex", alignItems: "center", gap: 14, opacity: snap(t, rowAt(runs.length)) }}>
              <div style={{ ...caption, color: color.accent, flex: "none" }}>Worst run</div>
              <div style={{ flex: 1, height: 4, backgroundColor: color.accentEdge }} />
            </div>
          ) : null}
          <RunRow run={worst} top={worstTop + (runs.length > 0 ? 10 : 0)} t={t} at={rowAt(runs.length) + 4} worst />
        </>
      ) : null}
    </>
  );
};

const Runs: React.FC<{ t: number; data: ArcadeData }> = ({ t, data }) => {
  const [best, ...others] = data.bestRuns;
  const hasList = others.length > 0 || data.worstRun !== null;
  if (best && (t < LIST_AT || !hasList)) return <BestRun t={t} run={best} />;
  return <OtherRuns t={best ? t - LIST_AT : t} runs={others} worst={data.worstRun} />;
};

const Upset: React.FC<{ t: number; data: ArcadeData }> = ({ t, data }) => {
  const upset = data.upset!;
  const name = displayCase(upset.tournamentName);
  const opponent = upset.opponent;
  const beaten = opponent?.gamerTag ? displayCase(opponent.gamerTag) : null;
  const seeds =
    upset.playerSeed !== null && opponent ? `Seed ${upset.playerSeed} beat seed ${opponent.seed}` : null;
  return (
    <>
      <div style={{ position: "absolute", left: 300 - 144, top: 100, opacity: t < 12 ? 1 : 0.35 }}>
        <Sprite rows={cycle(BOOM, Math.min(t, 11), 3)} palette={BOOM_PALETTE} px={18} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 44, display: "flex", justifyContent: "center" }}>
        <Slam frame={t} at={0} text="BIGGEST UPSET" style={display(48, color.ink)} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 124, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ ...caption, fontSize: 18, color: color.gold, opacity: snap(t, 6) }}>Upset factor</div>
        <div style={{ transform: `scale(${interpolate(spring({ frame: t - 6, fps: FPS, config: springPresets.heavy }), [0, 1], [2, 1])})`, opacity: t >= 6 ? 1 : 0 }}>
          <PixelText text={String(upset.factor)} px={16} fill={color.gold} />
        </div>
      </div>
      {opponent ? (
        <div style={{ position: "absolute", left: 44, right: 44, top: 304, display: "flex", alignItems: "center", gap: 20, opacity: snap(t, 16) }}>
          <div style={{ width: 96, height: 96, flex: "none", outline: `4px solid ${color.accent}`, backgroundColor: color.raised2 }}>
            <PixelImage src={opponent.avatarUrl} rows={24} px={4} mode="photo" levels={5} fallback={<div style={{ width: 96, height: 96, display: "flex", alignItems: "center", justifyContent: "center" }}><Chip text="VS" size={32} /></div>} />
          </div>
          <div style={{ minWidth: 0 }}>
            {seeds ? <div style={{ ...caption, fontSize: 18, color: color.accent }}>{seeds}</div> : null}
            {beaten ? (
              <div style={{ marginTop: 10 }}>
                {opponent.prefix ? <div style={display(16, color.muted)}>{displayCase(opponent.prefix)}</div> : null}
                <div style={{ ...display(fitDisplay(beaten, 48, 380)), marginTop: opponent.prefix ? 6 : 0 }}>{beaten}</div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 44, right: 44, top: opponent ? 440 : 380, display: "flex", alignItems: "center", gap: 20, opacity: snap(t, 24) }}>
        <div style={{ width: 80, height: 80, flex: "none", outline: `4px solid ${color.casingDeep}`, backgroundColor: color.raised2 }}>
          <PixelImage src={upset.tournamentImageUrl} rows={20} px={4} mode="photo" levels={5} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={display(fitDisplay(name, 32, 400))}>{name}</div>
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

  return (
    <>
      {card ? (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 268, display: "flex", justifyContent: "center" }}>
            <Slam frame={t} at={2} text="BEST RESULTS" style={display(64, color.gold)} fill={color.gold} />
          </div>
          {!hasRuns && !data.upset ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", ...caption, fontSize: 18 }}>No seeded runs reported</div>
          ) : null}
        </>
      ) : null}
      {t >= RUNS_AT && t < upsetAt && hasRuns ? <Runs t={t - RUNS_AT} data={data} /> : null}
      {t >= upsetAt && data.upset ? <Upset t={t - upsetAt} data={data} /> : null}
    </>
  );
};
