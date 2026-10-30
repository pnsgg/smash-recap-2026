import { BEAT } from "../../lib/motion";
import durations from "./sfx-durations.json";
import type { PanelCue, StickThrow } from "./components/ControlPanel";
import { TAG_PRESS_AT } from "./scenes/Stage3YourTag";
import { SIDE_HOPS } from "./scenes/Stage6PickASide";
import { START_PRESSES } from "./scenes/Stage8YourTurn";
import { at, DURATION, FPS, POWER_OFF, STAGES, WIPES } from "./timing";

/** A sound from the shared chiptune kit (apps/web/public/sfx, written by scripts/synth-sfx.ts). */
export type Sfx = keyof typeof durations;

export type Cue = { from: number; sfx: Sfx; volume?: number };

/** `count` cues of `sfx` from `start`, `step` frames apart, rounded onto whole frames. */
const run = (sfx: Sfx, count: number, start: number, step = BEAT, volume?: number): Cue[] =>
  Array.from({ length: count }, (_, i) => ({ from: Math.round(start + i * step), sfx, volume }));

/** Every sound in the trailer, on the 120 BPM grid (15 frames a beat, 60 a bar). */
export const CUES: Cue[] = [
  // 01 hello: the coin lights the tube, HEY, and PLAYER 1! land a beat apart
  { from: 0, sfx: "coin" },
  { from: at(1, 0, 1), sfx: "select" },
  { from: at(1, 0, 2), sfx: "stamp", volume: 0.7 },
  { from: at(1, 0, 3), sfx: "blip" },

  // 02 replay: the promise slams on beat 3, the list counts off on the second bar
  { from: at(2, 0), sfx: "blip" },
  { from: at(2, 0, 2), sfx: "impact", volume: 0.6 },
  ...run("select", 3, at(2, 1)),

  // The raster cuts into the three steps
  ...WIPES.map((from) => ({ from, sfx: "stamp" as const, volume: 0.6 })),

  // 03 your tag: a key per eighth note, START on the downbeat, a bell for "that's all"
  ...run("blip", 6, at(3, 0, 1), BEAT / 2, 0.6),
  { from: at(3, 1), sfx: "coin" },
  { from: at(3, 1, 2), sfx: "bell" },

  // 04 reading: a check a beat, ticks under the load meter, a bell when it is all set
  ...run("blip", 5, at(4, 0, 1)),
  ...run("tick", 10, at(4, 0, 1), BEAT / 2, 0.3),
  { from: at(4, 1, 2), sfx: "bell" },

  // 05 unlock: the high-score jingle rises a note per card, the sixth on its own
  { from: at(5, 0, 1), sfx: "hiscore" },
  { from: at(5, 1, 2), sfx: "select" },

  // 06 pick a side: the cursor hops on the beat, both sides light together
  { from: at(6, 0), sfx: "question" },
  ...run("blip", 4, at(6, 0, 1)),
  { from: at(6, 1, 1), sfx: "bell" },

  // 07 share: a chip per eighth note, then the download
  ...run("blip", 4, at(7, 0) + 4, BEAT / 2),
  { from: at(7, 0, 2) + 8, sfx: "select" },

  // 08 your turn: the field paints, the address drops, START pulses under the fanfare
  { from: at(8, 0), sfx: "select" },
  { from: at(8, 0, 2), sfx: "coin-drop" },
  { from: at(8, 1), sfx: "fanfare" },
  { from: at(8, 2), sfx: "coin" },
  { from: DURATION - POWER_OFF, sfx: "power-off" },
];

/** How long a cue's sound runs, in frames. */
export const cueFrames = (sfx: Sfx) => Math.ceil(durations[sfx] * FPS) + 1;

/** Hits that jolt the glass: PLAYER 1!, DESERVES A REPLAY., the address. */
export const IMPACTS = [at(1, 0, 2), at(2, 0, 2), at(8, 0, 2)];

/** The action button each kind of sound is "played" on, on the tall cabinet's control panel. */
const BUTTON_FOR: Partial<Record<Sfx, PanelCue["button"]>> = { blip: 0, select: 1, stamp: 2, bell: 2, impact: 1 };

/**
 * What the tall cabinet's panel plays along with: the action buttons on the cues, START where
 * the picture presses it (the tag's START in stage 3, the pulses in stage 8) and on the coins.
 */
export const PANEL_PRESSES: PanelCue[] = [
  ...CUES.flatMap((cue) => {
    const button = BUTTON_FOR[cue.sfx];
    return button === undefined ? [] : [{ from: cue.from, button }];
  }),
  ...CUES.filter((cue) => cue.sfx === "coin" && cue.from > 0).map((cue) => ({ from: cue.from, button: "start" as const })),
  { from: STAGES[2]!.from + TAG_PRESS_AT, button: "start" },
  ...START_PRESSES.map((from) => ({ from: STAGES[7]!.from + from, button: "start" as const })),
];

/** Stick throws: down and up with the side-select cursor (stacked on the tall glass), right on each step's cut. */
export const STICK_THROWS: StickThrow[] = [
  ...WIPES.map((from) => ({ from, x: 1, y: 0 })),
  ...SIDE_HOPS.map(({ at: from, to }) => ({ from: STAGES[5]!.from + from, x: 0, y: to === 1 ? 1 : -1 })),
];
