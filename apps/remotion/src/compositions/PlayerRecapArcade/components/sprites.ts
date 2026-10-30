import { color } from "../theme";


const goldShade = "#c08f17";
const outline = "#050606";

export const GOLD = { k: outline, a: color.gold, b: "#fff1b8", c: goldShade } as const;
export const RED = { k: outline, r: color.accent, R: color.accentStrong, e: color.accentEdge, w: color.ink } as const;
export const CASING = { k: outline, p: color.casing, q: color.casingDeep, d: color.cardMuted, w: color.ink } as const;

export const COIN = [
  [
    "..kkkkkk..",
    ".kbbbaaak.",
    "kbbaaaaack",
    "kbaacaaack",
    "kbaacaaack",
    "kbaacaaack",
    "kbaacaaack",
    "kaaaaaacck",
    ".kaaaacck.",
    "..kkkkkk..",
  ],
  [
    "...kkkk...",
    "..kbbaak..",
    "..kbaaak..",
    "..kbacak..",
    "..kbacak..",
    "..kbacak..",
    "..kbacak..",
    "..kaaack..",
    "..kaacck..",
    "...kkkk...",
  ],
  [
    "....kk....",
    "....kk....",
    "...kbck...",
    "...kbck...",
    "...kbck...",
    "...kbck...",
    "...kbck...",
    "...kbck...",
    "....kk....",
    "....kk....",
  ],
  [
    "...kkkk...",
    "..kaabbk..",
    "..kaaabk..",
    "..kacabk..",
    "..kacabk..",
    "..kacabk..",
    "..kacabk..",
    "..kcaaak..",
    "..kccaak..",
    "...kkkk...",
  ],
] as const;

export const COIN_STACKED = [".kkkkkkkk.", "kbbaaaaack", "kcccccccck", ".kkkkkkkk."] as const;

export const START_BUTTON = [
  [
    "....kkkkkkkk....",
    "..kkRRRrrrrrkk..",
    ".kRRRrrrrrrrrrk.",
    "kRRrrrrrrrrrrrrk",
    "krrrrrrrrrrrrrrk",
    "keerrrrrrrrrreek",
    "keeeeeeeeeeeeeek",
    ".kkeeeeeeeeeekk.",
    "...kkkkkkkkkk...",
  ],
  [
    "................",
    "................",
    "....kkkkkkkk....",
    "..kkRRRrrrrrkk..",
    ".kRRrrrrrrrrrrk.",
    "krrrrrrrrrrrrrrk",
    "keeeeeeeeeeeeeek",
    ".kkeeeeeeeeeekk.",
    "...kkkkkkkkkk...",
  ],
] as const;

export const HAND = [
  "....kk......",
  "...kwwk.....",
  "...kwwk.....",
  "...kwwk.....",
  "...kwwkkk...",
  "...kwwkwwkk.",
  ".kkkwwkwwkwk",
  "kwwkwwwwwwwk",
  "kwwwwwwwwwwk",
  ".kwwwwwwwwwk",
  ".kwwwwwwwwk.",
  "..kwwwwwwwk.",
  "...kwwwwwk..",
  "...kkkkkkk..",
] as const;

export const CROWN = [
  "k....k....k",
  "kak.kak.kak",
  "kaakaaakaak",
  "kaaaaaaaaak",
  "kabaabaabak",
  "kaaaaaaaaak",
  "kccccccccck",
  "kkkkkkkkkkk",
] as const;

export const STAR = [
  "...k...",
  "..kak..",
  "kkkakkk",
  "kaabaak",
  ".kaaak.",
  "kaakaak",
  "kk...kk",
] as const;

export const STORM = [
  [
    ".....kkkk.......",
    "...kkwwwwkk.....",
    "..kwwwwwwwwkkk..",
    ".kwwwwwwwwwwwwk.",
    "kwwwwwwwwwwwwwwk",
    "kqqwwwwwwwwwwqqk",
    ".kqqqqqqqqqqqqk.",
    "..kkkkkkkkkkkk..",
    "......kak.......",
    ".....kak........",
    "....kaaak.......",
    "......kak.......",
    ".....kak........",
    ".....kk.........",
  ],
] as const;
export const STORM_PALETTE = { k: outline, w: color.muted, q: color.cardMuted, a: color.gold } as const;

export const SIREN = [
  [
    "...kkkk...",
    "..keeeek..",
    ".keeeeeek.",
    ".keeeeeek.",
    ".keeeeeek.",
    "kkkkkkkkkk",
    "kqqqqqqqqk",
    "kkkkkkkkkk",
  ],
  [
    "...kkkk...",
    "..kRwwRk..",
    ".kRrrrrRk.",
    ".krrrrrrk.",
    ".krrrrrrk.",
    "kkkkkkkkkk",
    "kqqqqqqqqk",
    "kkkkkkkkkk",
  ],
] as const;
export const SIREN_PALETTE = { ...RED, q: color.casingDeep } as const;

export const SPARK = [
  ["...b...", "...a...", "b.aba.b", ".abwba.", "b.aba.b", "...a...", "...b..."],
  ["b..b..b", ".a.a.a.", "..aba..", "baawaab", "..aba..", ".a.a.a.", "b..b..b"],
  ["b.....b", "...a...", ".......", "a..w..a", ".......", "...a...", "b.....b"],
] as const;
export const SPARK_PALETTE = { a: color.gold, b: color.accent, w: color.ink } as const;

export const CHEST = [
  [
    "..kkkkkkkkkk..",
    ".kcccccccccck.",
    "kcaaaaaaaaaack",
    "kccccckkkcccck",
    "kkkkkkbakkkkkk",
    "kddddkbakddddk",
    "kddddkkkkddddk",
    "kddddddddddddk",
    "kcccccccccccck",
    "kkkkkkkkkkkkkk",
  ],
] as const;
export const CHEST_PALETTE = { ...GOLD, d: "#6b3f1d" } as const;

export const CRATE = [
  [
    "kkkkkkkkkkkkkkkk",
    "kwwwwwwwwwwwwwwk",
    "kwkkkkkkkkkkkkwk",
    "kwkpppppppppkkwk",
    "kwkppppppppkpkwk",
    "kwkpppppppkppkwk",
    "kwkppppppkpppkwk",
    "kwkpppppkppppkwk",
    "kwkppppkpppppkwk",
    "kwkpppkppppppkwk",
    "kwkppkpppppppkwk",
    "kwkpkppppppppkwk",
    "kwkkpppppppppkwk",
    "kwkkkkkkkkkkkkwk",
    "kwwwwwwwwwwwwwwk",
    "kkkkkkkkkkkkkkkk",
  ],
] as const;
export const CRATE_PALETTE = { k: outline, w: "#a8743a", p: "#7a4f24" } as const;

export const BOOM = [
  [
    "................",
    "................",
    "................",
    "......aaaa......",
    ".....abbbba.....",
    "....abwwwwba....",
    "....abwwwwba....",
    "....abwwwwba....",
    ".....abbbba.....",
    "......aaaa......",
    "................",
  ],
  [
    "......a..a......",
    "...a.aabbaa.a...",
    "....abbbbbbba...",
    "..aabbwwwwbbaa..",
    "..abbwwwwwwbba..",
    ".aabwwwwwwwwbaa.",
    "..abbwwwwwwbba..",
    "..aabbwwwwbbaa..",
    "....abbbbbbba...",
    "...a.aabbaa.a...",
    "......a..a......",
  ],
  [
    "..a...a..a...a..",
    "a..aabb..bbaa..a",
    "..abb..aa..bba..",
    ".ab..aabbaa..ba.",
    "ab..ab....ba..ba",
    ".a.ab......ba.a.",
    "ab..ab....ba..ba",
    ".ab..aabbaa..ba.",
    "..abb..aa..bba..",
    "a..aabb..bbaa..a",
    "..a...a..a...a..",
  ],
  [
    "a..............a",
    "...a..b..b..a...",
    ".b............b.",
    "....a......a....",
    "..b..........b..",
    "a..............a",
    "..b..........b..",
    "....a......a....",
    ".b............b.",
    "...a..b..b..a...",
    "a..............a",
  ],
] as const;
export const BOOM_PALETTE = { a: color.accent, b: color.gold, w: "#fff1b8" } as const;

export const ARROW_UP = ["...k...", "..kak..", ".kaaak.", "kaaaaak", "kkaaakk", "..kak..", "..kak..", "..kkk.."] as const;
export const ARROW_DOWN = [...ARROW_UP].reverse();

export const LOCK = [
  "..kkkk..",
  ".kqkkqk.",
  ".kq..qk.",
  "kkkkkkkk",
  "kqqqqqqk",
  "kqqkkqqk",
  "kqqkkqqk",
  "kkkkkkkk",
] as const;
export const LOCK_PALETTE = { k: outline, q: color.cardMuted } as const;

export const TICKET = [
  "kkkkkkkkkkkk",
  "kppprpppprpk",
  "kp.ppppppp.k",
  "kprrrrrrrrpk",
  "kp.ppppppp.k",
  "kppprpppprpk",
  "kkkkkkkkkkkk",
] as const;
export const TICKET_PALETTE = { k: outline, p: color.casing, r: color.accent } as const;

export const HEAD = [".hhh.", "hhhhh", ".fff.", ".fff.", "bbbbb"] as const;

export const LAMP_WON = [
  "..kkkkk..",
  ".kaaaaak.",
  "kaaaaagak",
  "kaaaagaak",
  "kagagaaak",
  "kaagaaaak",
  "kaaaaaaak",
  ".kaaaaak.",
  "..kkkkk..",
] as const;
export const LAMP_LOST = [
  "..kkkkk..",
  ".kaaaaak.",
  "kagaaagak",
  "kaagagaak",
  "kaaagaaak",
  "kaagagaak",
  "kagaaagak",
  ".kaaaaak.",
  "..kkkkk..",
] as const;
export const LAMP_OFF = [
  "..kkkkk..",
  ".kaaaaak.",
  "kaaaaaaak",
  "kaaaaaaak",
  "kaaaaaaak",
  "kaaaaaaak",
  "kaaaaaaak",
  ".kaaaaak.",
  "..kkkkk..",
] as const;

export const cycle = <T,>(frames: readonly T[], frame: number, every: number) =>
  frames[Math.floor(Math.max(0, frame) / every) % frames.length]!;
