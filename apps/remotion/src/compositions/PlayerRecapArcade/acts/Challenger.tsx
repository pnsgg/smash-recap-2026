import { interpolate } from "remotion";
import { clamp } from "../../../lib/motion";
import type { ActProps } from "../../PlayerRecapArcade";
import type { ArcadeData } from "../data";
import { snap, Stripes } from "../components/kit";
import { PixelImage } from "../components/PixelImage";
import { PixelText, Sprite } from "../components/Pixel";
import { Slam } from "../components/Slam";
import { cycle, SIREN, SIREN_PALETTE } from "../components/sprites";
import { blink, caption, color, display, displayCase, fitDisplay } from "../theme";

export const VS_AT = 45;
export const MATCHUPS_AT = 145;

const Hazard: React.FC<{ t: number; y: number; dir: 1 | -1 }> = ({ t, y, dir }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: y - 4,
      height: 48,
      boxSizing: "border-box",
      borderTop: `4px solid ${color.accentEdge}`,
      borderBottom: `4px solid ${color.accentEdge}`,
      overflow: "hidden",
    }}
  >
    <Stripes width={600} height={40} angle={45} period={40} band={20} fill={color.accent} background={color.ground} offset={dir * t * 4} />
  </div>
);

const Warning: React.FC<{ t: number }> = ({ t }) => (
  <>
    <div style={{ position: "absolute", inset: 0, backgroundColor: blink(t * 2) ? "#1a0705" : color.ground }} />
    <Hazard t={t} y={70} dir={1} />
    <Hazard t={t} y={490} dir={-1} />
    {[60, 476].map((x) => (
      <div key={x} style={{ position: "absolute", left: x, top: 150 }}>
        <Sprite rows={cycle(SIREN, t, 4)} palette={SIREN_PALETTE} px={6} />
      </div>
    ))}
    <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      <Slam frame={t} at={4} text="YOUR RIVAL" style={display(64, color.accent)} fill={color.accent} />
      <Slam frame={t} at={18} text="THE OPPONENT YOU PLAYED MOST" style={display(32)} />
    </div>
  </>
);

const Face: React.FC<{ src: string | null; tint?: boolean }> = ({ src, tint = false }) => (
  <div style={{ width: 208, height: 208, backgroundColor: color.ground, outline: `6px solid ${tint ? color.accentEdge : color.casingDeep}` }}>
    <PixelImage
      src={src}
      rows={26}
      px={8}
      mode="photo"
      levels={5}
      fallback={
        <div style={{ width: 208, height: 208, display: "flex", alignItems: "center", justifyContent: "center", ...display(96, color.accent) }}>?</div>
      }
    />
  </div>
);

const Versus: React.FC<{ t: number; data: ArcadeData }> = ({ t, data }) => {
  const opponent = data.rival!;
  const left = interpolate(snap(t, 0), [0, 1], [-320, 0]);
  const right = interpolate(snap(t, 4), [0, 1], [320, 0]);
  const name = displayCase(data.tag);
  const rival = displayCase(opponent.gamerTag ?? `#${opponent.opponentPlayerId}`);
  // Whoever leads the head-to-head gets the gold.
  const tone = (mine: number, theirs: number, base: string) => (mine > theirs ? color.gold : base);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, backgroundColor: color.raised, clipPath: "polygon(0 0, 330px 0, 270px 600px, 0 600px)", transform: `translateX(${left}px)` }} />
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#2a0a07", clipPath: "polygon(330px 0, 600px 0, 600px 600px, 270px 600px)", transform: `translateX(${right}px)` }} />
      <div style={{ position: "absolute", left: 40, top: 70, transform: `translateX(${left}px)` }}>
        <Face src={data.avatarUrl} />
        <div style={{ ...display(fitDisplay(name, 32, 230)), marginTop: 22 }}>{name}</div>
      </div>
      <div style={{ position: "absolute", left: 352, top: 70, transform: `translateX(${right}px)`, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <Face src={opponent.avatarUrl} tint />
        <div style={{ ...display(fitDisplay(rival, 32, 230), color.accent), marginTop: 22 }}>{rival}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 190, display: "flex", justifyContent: "center" }}>
        <Slam frame={t} at={10} text="VS" style={display(64, color.gold)} fill={color.gold} from={2.4} split={10} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 386, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, opacity: snap(t, 22) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <PixelText text={String(opponent.playerWonSet)} px={12} fill={tone(opponent.playerWonSet, opponent.opponentWonSet, color.ink)} />
          <PixelText text="-" px={12} fill={color.muted} />
          <PixelText text={String(opponent.opponentWonSet)} px={12} fill={tone(opponent.opponentWonSet, opponent.playerWonSet, color.accent)} />
        </div>
        <div style={{ ...caption, fontSize: 18, color: color.ink }}>Sets · your rival</div>
        <div style={{ ...caption }}>The opponent you played most · {opponent.totalSets} sets</div>
      </div>
    </>
  );
};

const Matchups: React.FC<{ t: number; data: ArcadeData }> = ({ t, data }) => {
  const { matchups } = data;
  const width = 172;
  // One size for every name in the row: names wrap onto two lines, so only the longest word has to fit.
  const nameSize = Math.min(
    ...matchups.flatMap((m) => displayCase(m.characterName).split(" ").map((word) => fitDisplay(word, 32, width))),
  );
  return (
    <>
      <div style={{ position: "absolute", left: 40, top: 42 }}>
        <Slam frame={t} at={0} text="TOUGHEST MATCHUPS" style={display(32, color.accent)} fill={color.accent} />
        <div style={{ ...caption, marginTop: 12, opacity: snap(t, 8) }}>Characters you lost the most games to</div>
      </div>
      <div style={{ position: "absolute", left: 300 - (matchups.length * width + (matchups.length - 1) * 14) / 2, top: 120, display: "flex", gap: 14 }}>
        {matchups.map((m, i) => {
          const enter = snap(t, 10 + i * 8);
          const won = m.count - m.lossCount;
          const name = displayCase(m.characterName);
          return (
            <div key={m.characterId} style={{ width, opacity: enter > 0 ? 1 : 0, transform: `translateY(${interpolate(enter, [0, 1], [60, 0])}px)` }}>
              <div
                style={{
                  position: "relative",
                  height: 216,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  backgroundColor: "#1a0705",
                  boxSizing: "border-box",
                  borderBottom: `6px solid ${color.accentEdge}`,
                }}
              >
                {/* A red filter over the fighter in full colour, baked into the sprite: still recognisable, clearly the enemy */}
                <PixelImage
                  src={m.renderUrl}
                  rows={66}
                  maxCols={52}
                  px={3}
                  tint={[color.accent, 0.55]}
                  fallback={
                    <PixelImage
                      src={m.stockIconUrl}
                      rows={20}
                      px={6}
                      tint={[color.accent, 0.55]}
                      fallback={<div style={display(64, color.accent)}>?</div>}
                    />
                  }
                />
              </div>
              <div style={{ ...display(nameSize), whiteSpace: "normal", lineHeight: 1.1, height: nameSize * 2.2, marginTop: 14, display: "flex", alignItems: "flex-end" }}>
                {name}
              </div>
              {/* Your health against them: the red is the games they took */}
              <div style={{ display: "flex", height: 16, marginTop: 12, outline: `3px solid ${color.casingDeep}` }}>
                <div style={{ flex: won, backgroundColor: color.ink }} />
                <div
                  style={{
                    flex: m.lossCount * interpolate(t, [20 + i * 8, 44 + i * 8], [0, 1], clamp) + 0.0001,
                    backgroundColor: color.accent,
                  }}
                />
                <div style={{ flex: m.lossCount * interpolate(t, [20 + i * 8, 44 + i * 8], [1, 0], clamp), backgroundColor: color.ink }} />
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginTop: 14 }}>
                <PixelText text={`${m.lossCount}/${m.count}`} px={4} fill={color.accent} />
              </div>
              <div style={{ ...caption, marginTop: 8 }}>games lost</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export const Challenger: React.FC<ActProps> = ({ t, data }) => {
  if (t < VS_AT) return <Warning t={t} />;
  if (t < MATCHUPS_AT && data.rival) return <Versus t={t - VS_AT} data={data} />;
  if (t < MATCHUPS_AT) {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <Slam frame={t - VS_AT} at={0} text="NO RIVAL" style={display(48, color.gold)} fill={color.gold} />
        <div style={{ ...caption, fontSize: 18 }}>No opponent faced in 3+ sets</div>
      </div>
    );
  }
  return <Matchups t={t - MATCHUPS_AT} data={data} />;
};
