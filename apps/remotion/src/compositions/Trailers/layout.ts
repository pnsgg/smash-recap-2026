import { useVideoConfig } from "remotion";

export type FormatKind = "wide" | "square" | "tall";

type Box = { top: number; left: number; width: number; height: number };

type Format = {
  /** Putty around the glass, the lit marquee, the glass itself, and (tall only) the control panel. */
  cabinet: { frame: number; marquee: { top: number; height: number }; screen: Box; panel?: Box };
  /** Content area inside the glass, under the telemetry header, in screen coordinates. */
  column: { left: number; width: number; top: number; bottom: number };
};

/**
 * One cabinet per aspect ratio, reframed rather than cropped. The tall cabinet grows a control
 * panel under the glass: it fills the strip that Reels and TikTok cover with their own UI, so no
 * copy ever sits there.
 */
const FORMATS: Record<FormatKind, Format> = {
  wide: {
    cabinet: {
      frame: 24,
      marquee: { top: 22, height: 60 },
      screen: { top: 96, left: 24, width: 1872, height: 960 },
    },
    column: { left: 120, width: 1632, top: 150, bottom: 900 },
  },
  square: {
    cabinet: {
      frame: 20,
      marquee: { top: 18, height: 56 },
      screen: { top: 86, left: 20, width: 1040, height: 974 },
    },
    column: { left: 64, width: 912, top: 130, bottom: 930 },
  },
  tall: {
    cabinet: {
      frame: 20,
      marquee: { top: 20, height: 76 },
      screen: { top: 108, left: 20, width: 1040, height: 1372 },
      panel: { top: 1500, left: 20, width: 1040, height: 400 },
    },
    column: { left: 64, width: 880, top: 150, bottom: 1320 },
  },
};

/** Average advance of a DOSIyagiBoldface capital, as a fraction of its size. */
const ADVANCE = 0.6;

/** The cabinet for the current composition, picked from its aspect ratio. */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const kind: FormatKind = width > height ? "wide" : width === height ? "square" : "tall";
  const format = FORMATS[kind];
  return {
    kind,
    ...format,
    narrow: kind !== "wide",
    /**
     * The largest display size up to `max` that keeps the longest line of `text` inside `width`
     * (the column by default).
     */
    fit: (text: string, max: number, width: number = format.column.width, advance = ADVANCE) =>
      Math.min(max, Math.floor(width / (Math.max(...text.split("\n").map((l) => l.length), 1) * advance))),
  };
};

export type Layout = ReturnType<typeof useLayout>;
