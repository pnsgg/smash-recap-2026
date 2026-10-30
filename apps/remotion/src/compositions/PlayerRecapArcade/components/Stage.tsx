import { random } from "remotion";
import { color, uncapped } from "../theme";

export const STAGE_COLS = 120;
export const STAGE_ROWS = 80;
export const FLOOR = 52;

type Platform = { x: number; y: number; w: number };
type Layout = { main: number; shape: "tapered" | "flat" | "ship"; platforms: Platform[] };

const side = (y: number, w = 0.22, x = 0.28): Platform[] => [
  { x: -x, y, w },
  { x, y, w },
];

const LAYOUTS: Record<string, Layout> = {
  battlefield: { main: 0.62, shape: "tapered", platforms: [...side(14, 0.24, 0.27), { x: 0, y: 27, w: 0.24 }] },
  "small battlefield": { main: 0.56, shape: "tapered", platforms: [...side(12, 0.24, 0.25), { x: 0, y: 24, w: 0.24 }] },
  "dream land": { main: 0.66, shape: "tapered", platforms: [...side(15, 0.24, 0.28), { x: 0, y: 29, w: 0.24 }] },
  "dream land gb": { main: 0.66, shape: "tapered", platforms: [...side(15, 0.24, 0.28), { x: 0, y: 29, w: 0.24 }] },
  "yoshis story": { main: 0.6, shape: "tapered", platforms: [...side(12, 0.22, 0.28), { x: 0, y: 23, w: 0.22 }] },
  "fountain of dreams": { main: 0.6, shape: "tapered", platforms: [...side(11, 0.2, 0.3), { x: 0, y: 24, w: 0.24 }] },
  "lylat cruise": { main: 0.7, shape: "ship", platforms: [...side(13, 0.2, 0.25), { x: 0, y: 24, w: 0.22 }] },
  "final destination": { main: 0.7, shape: "tapered", platforms: [] },
  "kalos pokemon league": { main: 0.72, shape: "flat", platforms: [] },
  "pokemon stadium": { main: 0.72, shape: "flat", platforms: side(13, 0.2, 0.3) },
  "pokemon stadium 2": { main: 0.72, shape: "flat", platforms: side(13, 0.2, 0.3) },
  smashville: { main: 0.66, shape: "flat", platforms: [{ x: 0, y: 15, w: 0.26 }] },
  "town and city": { main: 0.66, shape: "flat", platforms: [...side(13, 0.2, 0.28), { x: 0, y: 22, w: 0.22 }] },
  "hollow bastion": { main: 0.66, shape: "tapered", platforms: [{ x: 0, y: 16, w: 0.3 }] },
};

const normalise = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’'.]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const proceduralLayout = (id: string): Layout => {
  const r = (k: string) => random(`stage-${id}-${k}`);
  const main = 0.56 + r("main") * 0.18;
  const kind = Math.floor(r("kind") * 4);
  const y = 12 + Math.round(r("y") * 4);
  const platforms: Platform[] =
    kind === 0 ? [] : kind === 1 ? [{ x: 0, y: y + 3, w: 0.26 }] : kind === 2 ? side(y) : [...side(y), { x: 0, y: y * 2, w: 0.22 }];
  return { main, shape: r("shape") > 0.5 ? "tapered" : "flat", platforms };
};

export const stageLayout = (stage: { stageId: string; stageName: string }) =>
  LAYOUTS[normalise(stage.stageName)] ?? proceduralLayout(stage.stageId);

export const FEET = { x: STAGE_COLS / 2, y: FLOOR };

export type StageMood = "night" | "dusk" | "gold" | "storm";

type Sky = {
  bands: string[];
  star: string;
  ground: string;
  groundDeep: string;
  edge: string;
  hills: string;
  orb: string | null;
};

const SKIES: Record<StageMood, Sky> = {
  night: {
    bands: ["#07100c", "#0e1d15", "#17301f", "#22442c"],
    star: color.ink,
    ground: "#2e3a33",
    groundDeep: color.raised,
    edge: color.ink,
    hills: "#12261a",
    orb: color.ink,
  },
  dusk: {
    bands: ["#1a0806", "#3a120b", "#6e1f11", "#a8361c"],
    star: "#fff1b8",
    ground: "#2a1a14",
    groundDeep: "#170d0a",
    edge: color.gold,
    hills: "#3a140c",
    orb: color.gold,
  },
  gold: {
    bands: ["#2a1c06", "#4d330b", "#80560f", "#b98219"],
    star: "#fff1b8",
    ground: "#3a2f18",
    groundDeep: "#1f190c",
    edge: color.gold,
    hills: "#5a3d0c",
    orb: "#fff1b8",
  },
  storm: {
    bands: ["#0d0606", "#1c0b09", "#2d120e", "#3f1913"],
    star: color.accentStrong,
    ground: "#2e1c19",
    groundDeep: "#160d0c",
    edge: color.accent,
    hills: "#24100c",
    orb: null,
  },
};

export const tileMood = (stageId: string): StageMood => (random(`sky-${stageId}`) < 0.5 ? "night" : "dusk");

export const StageDiorama: React.FC<{
  stage: { stageId: string; stageName: string };
  width: number;
  mood?: StageMood;
  frame?: number;
  orb?: boolean;
  children?: React.ReactNode;
}> = ({ stage, width, mood = "night", frame = 0, orb = true, children }) => {
  const layout = stageLayout(stage);
  const sky = SKIES[mood];
  const unit = width / STAGE_COLS;
  const r = (k: string) => random(`stage-art-${stage.stageId}-${k}`);

  const bandH = 13;
  const bands = sky.bands.map((fill, i) => <rect key={`b${i}`} x={0} y={i * bandH} width={STAGE_COLS} height={i === sky.bands.length - 1 ? STAGE_ROWS : bandH} fill={fill} />);
  // Checkerboard dither on each seam, like a 16-colour palette faking a gradient.
  let dither = "";
  for (let i = 1; i < sky.bands.length; i++) {
    const y = i * bandH - 1;
    for (let x = 0; x < STAGE_COLS; x++) if ((x + y) % 2 === 0) dither += `M${x} ${y}h1v1h-1z`;
  }

  let stars = "";
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(r(`sx${i}`) * STAGE_COLS);
    const y = Math.floor(r(`sy${i}`) * 34);
    const twinkle = Math.floor(frame / 15 + r(`st${i}`) * 4) % 4 !== 0;
    if (twinkle) stars += `M${x} ${y}h1v1h-1z`;
  }

  // Far hills: a ridge of stepped columns.
  let hills = "";
  let h = 6 + Math.floor(r("h0") * 6);
  for (let x = 0; x < STAGE_COLS; x += 2) {
    h = Math.max(3, Math.min(16, h + Math.round((r(`h${x}`) - 0.5) * 4)));
    hills += `M${x} ${FLOOR + 10 - h}h2v${h + 30}h-2z`;
  }

  const orbX = 16 + Math.floor(r("orb") * 22) + (r("side") > 0.5 ? 72 : 0);
  const mainW = Math.round(STAGE_COLS * layout.main);
  const mainX = Math.round((STAGE_COLS - mainW) / 2);
  const body =
    layout.shape === "tapered"
      ? `M${mainX} ${FLOOR}h${mainW}v4h-3v4h-4v4h-6v3h-${mainW - 26}v-3h-6v-4h-4v-4h-3z`
      : layout.shape === "ship"
        ? `M${mainX} ${FLOOR}h${mainW}v3h-6v4h-10v4h-${mainW - 32}v-4h-10v-4h-6z`
        : `M${mainX} ${FLOOR}h${mainW}v10h-${mainW}z`;

  return (
    <svg
      width={width}
      height={unit * STAGE_ROWS}
      viewBox={`0 0 ${STAGE_COLS} ${STAGE_ROWS}`}
      shapeRendering="crispEdges"
      style={{ display: "block", overflow: "hidden", ...uncapped }}
    >
      {bands}
      <path d={dither} fill={sky.bands[0]} opacity={0.6} />
      <path d={stars} fill={sky.star} />
      {orb && sky.orb ? (
        <path
          d={`M${orbX - 3} ${9}h6v1h2v2h1v6h-1v2h-2v1h-6v-1h-2v-2h-1v-6h1v-2h2z`}
          fill={sky.orb}
          opacity={0.9}
        />
      ) : null}
      <path d={hills} fill={sky.hills} />
      <path d={body} fill={sky.ground} />
      <rect x={mainX} y={FLOOR} width={mainW} height={2} fill={sky.edge} />
      <rect x={mainX} y={FLOOR + 2} width={mainW} height={1} fill={sky.groundDeep} />
      {layout.platforms.map((p, i) => {
        const w = Math.round(STAGE_COLS * p.w);
        const x = Math.round(STAGE_COLS / 2 + p.x * STAGE_COLS - w / 2);
        return (
          <g key={i}>
            <rect x={x} y={FLOOR - p.y} width={w} height={3} fill={sky.groundDeep} />
            <rect x={x} y={FLOOR - p.y} width={w} height={2} fill={sky.edge} />
          </g>
        );
      })}
      {children}
    </svg>
  );
};
