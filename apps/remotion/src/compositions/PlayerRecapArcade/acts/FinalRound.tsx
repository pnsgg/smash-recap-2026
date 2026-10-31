import { interpolate, spring } from "remotion";
import { springPresets } from "../../../lib/motion";
import type { ActProps } from "../../PlayerRecapArcade";
import { rollUp, snap } from "../components/kit";
import { PixelImage } from "../components/PixelImage";
import { PixelText, Sprite } from "../components/Pixel";
import { Slam } from "../components/Slam";
import { STAR } from "../components/sprites";
import { FPS } from "../timing";
import { caption, color, display, percent } from "../theme";

// Three announcer screens, one per stat, hard cuts between them.
const SCREENS_AT = [0, 100, 200] as const;

type Screen = { word: string; figure: number; of?: number; line: string; sub: string; bg: string; ink: string; accent: string };

const Announcer: React.FC<{ screen: Screen; t: number; spriteUrl: string | null; stars: boolean }> = ({ screen, t, spriteUrl, stars }) => {
  const hop = Math.abs(Math.sin((t / 15) * Math.PI)) * 18;
  const land = interpolate(spring({ frame: t - 8, fps: FPS, config: springPresets.heavy }), [0, 1], [1.4, 1]);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: screen.bg }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", justifyContent: "center" }}>
        <Slam frame={t} at={2} text={screen.word} style={display(64, screen.ink)} fill={screen.ink} split={10} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 180, display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 14, transform: `scale(${land})`, opacity: t >= 8 ? 1 : 0 }}>
        <PixelText text={String(rollUp(screen.figure, t, 8, 16))} px={26} fill={screen.ink} />
        {screen.of !== undefined ? <PixelText text={`/${screen.of}`} px={8} fill={screen.accent} /> : null}
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 400, textAlign: "center", opacity: snap(t, 18) }}>
        <div style={display(32, screen.ink)}>{screen.line}</div>
        <div style={{ ...caption, fontSize: 18, color: screen.accent, marginTop: 14 }}>{screen.sub}</div>
      </div>
      {spriteUrl ? (
        <div style={{ position: "absolute", right: 24, bottom: 24 + hop, opacity: snap(t, 12) }}>
          <PixelImage src={spriteUrl} rows={28} maxCols={28} px={3} />
        </div>
      ) : null}
      {stars
        ? [
            [40, 40],
            [520, 40],
            [40, 520],
          ].map(([x, y], i) =>
            Math.floor(t / 8 + i) % 2 === 0 ? (
              <div key={i} style={{ position: "absolute", left: x, top: y }}>
                <Sprite rows={STAR} palette={{ k: "#050606", a: color.ground, b: color.ground }} px={5} />
              </div>
            ) : null,
          )
        : null}
    </div>
  );
};

export const FinalRound: React.FC<ActProps> = ({ t, data }) => {
  const { deciding, cleanSweeps, reverseSweeps, main } = data;
  const screens: Screen[] = [
    {
      word: "CLOSE SETS",
      figure: deciding.winCount,
      of: deciding.count,
      line: "SETS WON BY ONE GAME",
      sub: `${deciding.count} sets decided by one game · ${percent(deciding.winRate)} won`,
      bg: color.accent,
      ink: color.ink,
      accent: color.ground,
    },
    {
      word: "CLEAN SWEEPS",
      figure: cleanSweeps,
      line: "SETS WON",
      sub: "Without dropping a game",
      bg: color.gold,
      ink: color.ground,
      accent: color.accentEdge,
    },
    {
      word: "REVERSE SWEEPS",
      figure: reverseSweeps.won,
      line: "SETS WON",
      sub: `Won ${reverseSweeps.won} · lost ${reverseSweeps.lost}`,
      bg: color.osd,
      ink: color.ground,
      accent: color.ground,
    },
  ];
  const index = SCREENS_AT.reduce<number>((found, at, i) => (t >= at ? i : found), 0);
  const since = t - SCREENS_AT[index]!;
  const flash = index > 0 && since < 2;

  return (
    <>
      <Announcer key={index} screen={screens[index]!} t={since} spriteUrl={main?.renderUrl ?? null} stars={index === 1} />
      {flash ? <div style={{ position: "absolute", inset: 0, backgroundColor: "#ffffff" }} /> : null}
    </>
  );
};
