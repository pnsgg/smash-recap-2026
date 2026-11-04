import { interpolate } from "remotion";
import type { ActProps } from "../../PlayerRecapArcade";
import { snap } from "../components/kit";
import { PixelImage } from "../components/PixelImage";
import { PixelText } from "../components/Pixel";
import { Slam } from "../components/Slam";
import { caption, color, display, displayCase, fitDisplay } from "../theme";

/** "1st", "2nd", "3rd", "14th", "112th". */
export const ordinal = (n: number) => {
  const tens = n % 100;
  const suffix = tens >= 11 && tens <= 13 ? "th" : (["th", "st", "nd", "rd"][n % 10] ?? "th");
  return `${n}${suffix}`;
};

const SHOWN = 3;
const ROW_AT = 12;
const ROW_STEP = 14;
const AREA = { left: 44, top: 140, width: 512, height: 440 } as const;

/** Sizes per column count: one ranking fills the middle, two or three share it in columns. */
const SIZES = {
  1: { image: 144, px: 14, name: 48, gap: 18 },
  2: { image: 128, px: 11, name: 32, gap: 18 },
  3: { image: 96, px: 8, name: 16, gap: 14 },
} as const;

type Ranking = ActProps["data"]["rankings"][number];

/** Names wrap onto several lines, so only the longest word has to fit the column. */
const longestWord = (text: string) => text.split(" ").reduce((a, b) => (b.length > a.length ? b : a), "");

/** A series with no logo on start.gg: its initials, e.g. SUT for Smash Ultimate Toulouse. */
const Initials: React.FC<{ name: string; side: number }> = ({ name, side }) => {
  const initials = name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 3);
  return (
    <div style={{ width: side, height: side, display: "flex", alignItems: "center", justifyContent: "center", ...display(side >= 128 ? 48 : 32, color.muted) }}>
      {initials}
    </div>
  );
};

const Card: React.FC<{ r: Ranking; size: (typeof SIZES)[keyof typeof SIZES]; width: number; first: boolean; t: number; at: number }> = ({
  r,
  size,
  width,
  first,
  t,
  at,
}) => {
  const rank = String(r.rank);
  const series = displayCase(r.seriesName);
  const ink = first ? color.gold : color.ink;
  return (
    <div
      style={{
        width,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: size.gap,
        opacity: t >= at ? 1 : 0,
        transform: `translateY(${interpolate(snap(t, at), [0, 1], [40, 0])}px)`,
      }}
    >
      <div style={{ width: size.image, height: size.image, flex: "none", outline: `5px solid ${first ? color.gold : color.casingDeep}`, backgroundColor: color.raised2 }}>
        <PixelImage src={r.imageUrl} rows={size.image / 4} px={4} mode="photo" levels={5} fallback={<Initials name={series} side={size.image} />} />
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
        <PixelText text={rank} px={size.px} fill={ink} />
        <div style={{ ...display(size.px >= 11 ? 32 : 16, ink), marginBottom: 2 }}>{ordinal(r.rank).slice(rank.length).toUpperCase()}</div>
      </div>
      <div>
        <div style={{ ...display(Math.min(size.name, fitDisplay(longestWord(series), size.name, width)), color.ink), whiteSpace: "normal", lineHeight: 1.1 }}>{series}</div>
        <div style={{ ...caption, marginTop: 10, color: color.ink, whiteSpace: "normal" }}>{r.title}</div>
        {r.previousRank !== null ? (
          <div style={{ ...caption, marginTop: 6, whiteSpace: "normal" }}>Previously {ordinal(r.previousRank)}</div>
        ) : null}
      </div>
    </div>
  );
};

/** The player's place in every ranking published for their season, as start.gg lists them. */
export const Rankings: React.FC<ActProps> = ({ t, data }) => {
  const rankings = data.rankings.slice(0, SHOWN);
  const cols = Math.max(1, rankings.length) as 1 | 2 | 3;
  const size = SIZES[cols];
  const gap = 20;
  const width = (AREA.width - (cols - 1) * gap) / cols;
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 40, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Slam frame={t} at={0} text="YOUR RANKINGS" style={display(32, color.gold)} fill={color.gold} />
        <div style={{ ...caption, marginTop: 12, opacity: snap(t, 4) }}>Published for your 2026 season</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: AREA.left,
          top: AREA.top,
          width: AREA.width,
          height: AREA.height,
          display: "flex",
          flexWrap: "wrap",
          alignContent: "center",
          justifyContent: "center",
          gap,
        }}
      >
        {rankings.map((r, i) => (
          <Card key={`${r.seriesName}-${r.title}`} r={r} size={size} width={width} first={i === 0} t={t} at={ROW_AT + i * ROW_STEP} />
        ))}
      </div>
    </>
  );
};
