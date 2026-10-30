/**
 * One downloadable recap image per place people post it, each sized to what that platform shows
 * without cropping (checked October 2026; see the `why` of each). Which rows each format has room
 * for depends on the recap: see PlayerStills.tsx and OrganizerStills.tsx.
 *
 * `layout: "rows"` drops the section headers and prefixes each row with its stage instead, for
 * formats too short for headers.
 */
export type StillFormat = {
  platform: string;
  width: number;
  height: number;
  layout: "sections" | "rows";
  why: string;
};

export const STILL_FORMATS = {
  x: {
    platform: "X",
    width: 1080,
    height: 1350,
    layout: "sections",
    why: "X shows single images in full from 2:1 to 3:4 (2021 rollout); 4:5 stays inside that range.",
  },
  bluesky: {
    platform: "Bluesky",
    width: 1080,
    height: 1080,
    layout: "rows",
    why: "Bluesky's web client fits feed images in a 1:1 box (AutoSizedImage.tsx), so square shows largest on web and app.",
  },
  threads: {
    platform: "Threads",
    width: 1080,
    height: 1350,
    layout: "sections",
    why: "4:5 portrait, the size Threads' feed is consistently documented to show uncropped.",
  },
  reddit: {
    platform: "Reddit",
    width: 1080,
    height: 1350,
    layout: "sections",
    why: "No official spec; 4:5 is the common recommendation, and images taller than about 2:1 get clipped in feeds.",
  },
  instagram: {
    platform: "Instagram",
    width: 1080,
    height: 1440,
    layout: "sections",
    why: "Instagram feed photos keep their shape from 1.91:1 to 3:4 since 2025; 3:4 is the tallest.",
  },
  story: {
    platform: "Stories",
    width: 1080,
    height: 1920,
    layout: "sections",
    why: "9:16, full screen on a phone: Instagram, Threads and Facebook stories.",
  },
} as const satisfies Record<string, StillFormat>;

export type StillFormatKey = keyof typeof STILL_FORMATS;

export const STILL_FORMAT_KEYS = Object.keys(STILL_FORMATS) as StillFormatKey[];

/** All stills are laid out at half size in design units and scaled ×2, like the video's 600×600. */
export const STILL_SCALE = 2;

/** The format's part of a <Still> id: "X", "Bluesky", …, "Story". */
export const stillIdSuffix = (key: StillFormatKey) =>
  key.charAt(0).toUpperCase() + key.slice(1);
