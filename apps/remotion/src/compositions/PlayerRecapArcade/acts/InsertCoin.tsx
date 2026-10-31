import { interpolate } from "remotion";
import { clamp } from "../../../lib/motion";
import type { ActProps } from "../../PlayerRecapArcade";
import { Chip, snap } from "../components/kit";
import { PixelImage } from "../components/PixelImage";
import { PixelText } from "../components/Pixel";
import { Slam } from "../components/Slam";
import { blink, color, display, displayCase, fitDisplay, font } from "../theme";

const TEST_AT = 30;
const PAINT_AT = 130;
const PAINT_FRAMES = 26;
const ROWS = 46;
const PX = 13;

const TEST_LINES = [
  { text: "SMASHRECAP 2026", status: "" },
  { text: "ROM", status: "OK" },
  { text: "RAM", status: "OK" },
  { text: "START.GG LINK", status: "OK" },
  { text: "SEASON DATA", status: "OK" },
] as const;

const BARS = [color.ink, color.gold, color.osd, color.cyan, color.accent, color.accentEdge, color.raised2, color.ground];

const SelfTest: React.FC<{ t: number; tag: string; slot: string }> = ({ t, tag, slot }) => {
  const line = (i: number) => TEST_AT + 6 + i * 12;
  const loadingAt = line(TEST_LINES.length);
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${color.raised2} 2px, transparent 2px), linear-gradient(90deg, ${color.raised2} 2px, transparent 2px)`,
          backgroundSize: "50px 50px",
          backgroundPosition: "-1px -1px",
        }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 30, height: 56, display: "flex" }}>
        {BARS.map((fill, i) => (
          <div key={fill} style={{ flex: 1, backgroundColor: fill, transform: `scaleY(${snap(t, i * 2)})`, transformOrigin: "top" }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 60, top: 140, width: 480 }}>
        {TEST_LINES.map((row, i) =>
          t >= line(i) ? (
            <div key={row.text} style={{ display: "flex", ...display(32, color.osd), height: 48 }}>
              <div>{row.text}</div>
              {row.status ? (
                <>
                  <div style={{ flex: 1, margin: "0 10px", borderBottom: `4px dotted ${color.raised2}`, height: 22 }} />
                  <div style={{ color: t >= line(i) + 4 ? color.osd : "transparent" }}>{row.status}</div>
                </>
              ) : null}
            </div>
          ) : null,
        )}
        {t >= loadingAt ? (
          <div style={{ marginTop: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Chip text={slot} />
              <div style={display(32, color.ink)}>LOADING {displayCase(tag)}</div>
              <div style={{ width: 16, height: 28, backgroundColor: blink(t * 2) ? color.ink : "transparent" }} />
            </div>
            <div style={{ marginTop: 18, height: 20, outline: `3px solid ${color.casingDeep}`, backgroundColor: color.raised }}>
              <div
                style={{
                  width: `${Math.floor(interpolate(t, [loadingAt, PAINT_AT], [0, 10], clamp)) * 10}%`,
                  height: "100%",
                  backgroundColor: color.accent,
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

const NoAvatar: React.FC = () => (
  <div style={{ width: ROWS * PX, height: ROWS * PX, backgroundColor: color.raised, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <PixelText text="1" px={40} fill={color.accentEdge} />
  </div>
);

type IntroProps = {
  t: number;
  tag: string;
  prefix: string | null;
  avatarUrl: string | null;
  slot: string;
  role: string;
  subtitle: string;
};

export const InsertCoin: React.FC<ActProps> = ({ t, data }) => (
  <Intro
    t={t}
    tag={data.tag}
    prefix={data.prefix}
    avatarUrl={data.avatarUrl}
    slot="1P"
    role="PLAYER 1"
    subtitle={`SEASON 2026 · ${data.totalTournaments} TOURNAMENTS`}
  />
);

export const Intro: React.FC<IntroProps> = ({ t, tag, prefix, avatarUrl, slot, role, subtitle }) => {
  if (t < PAINT_AT) return <SelfTest t={t} tag={tag} slot={slot} />;

  const since = t - PAINT_AT;
  const painted = Math.floor(interpolate(since, [0, PAINT_FRAMES], [0, ROWS], clamp));
  const name = displayCase(tag);
  const nameSize = fitDisplay(name, 96, 500);
  const enter = since - PAINT_FRAMES;

  return (
    <>
      {/* The portrait, painted top to bottom with the beam's bright edge leading */}
      <div style={{ position: "absolute", left: (600 - ROWS * PX) / 2, top: (600 - ROWS * PX) / 2, clipPath: `inset(0 0 ${(ROWS - painted) * PX}px 0)` }}>
        <PixelImage src={avatarUrl} rows={ROWS} px={PX} mode="photo" levels={6} fallback={<NoAvatar />} />
      </div>
      {painted < ROWS ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: (600 - ROWS * PX) / 2 + painted * PX, height: PX, backgroundColor: color.ink }} />
      ) : null}
      {/* Darker lines across the picture so the type over it reads */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: color.ground, opacity: interpolate(enter, [0, 8], [0, 0.35], clamp) }} />

      {/* Player 1 enters */}
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 44,
          display: "flex",
          flexDirection: role.length > 12 ? "column" : "row",
          alignItems: role.length > 12 ? "flex-start" : "center",
          gap: 14,
          opacity: enter >= 0 ? 1 : 0,
        }}
      >
        <Chip text={slot} size={32} />
        <div style={{ ...display(32), textShadow: `4px 4px 0 ${color.ground}` }}>{role}</div>
      </div>

      <div
        style={{
          position: "absolute",
          left: -20,
          right: -20,
          top: 372,
          height: nameSize + 92,
          backgroundColor: color.accent,
          boxShadow: `0 8px 0 ${color.accentEdge}`,
          transform: `skewY(-4deg) scaleX(${snap(enter, 2)})`,
          transformOrigin: "left",
        }}
      />
      <div style={{ position: "absolute", left: 44, top: 380, transform: "rotate(-4deg)", transformOrigin: "left" }}>
        {prefix ? <div style={{ ...display(32, color.ground), opacity: snap(enter, 8) }}>{displayCase(prefix)}</div> : null}
        <div style={{ marginTop: 6 }}>
          <Slam frame={enter} at={10} text={name} style={display(nameSize, color.ink)} fill={color.ink} />
        </div>
        <div style={{ fontFamily: font.text, fontWeight: 800, fontSize: 18, letterSpacing: "0.08em", color: color.ground, marginTop: 10, opacity: snap(enter, 18) }}>
          {subtitle}
        </div>
      </div>
    </>
  );
};
