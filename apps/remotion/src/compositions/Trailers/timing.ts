import { BAR, BEAT } from "../../lib/motion";

export const FPS = 30;

/** The eight stages, in bars of 120 BPM 4/4 (60 frames a bar at 30 fps): 15 bars, 30 s. */
const STAGE_BARS = [1, 2, 2, 2, 2, 2, 1, 3] as const;

export const STAGES = STAGE_BARS.map((bars, index) => ({
  stage: index + 1,
  from: STAGE_BARS.slice(0, index).reduce((sum, b) => sum + b * BAR, 0),
  durationInFrames: bars * BAR,
}));

export const DURATION = STAGES.reduce((sum, s) => sum + s.durationInFrames, 0);

/** Frame of beat `beat` (0-based) inside bar `bar` (0-based) of stage `stage` (1-based). */
export const at = (stage: number, bar: number, beat = 0) => STAGES[stage - 1]!.from + bar * BAR + beat * BEAT;

/** Cuts the raster wipe covers: 2 → 3 through 5 → 6. The rest are hard cuts on the downbeat; stage 8 paints its own field. */
export const WIPES = STAGES.slice(2, 5).map((s) => s.from);

/** The tube switches off over the last frames so the end matches the black first frame. */
export const POWER_OFF = 18;

export const STAGE_NAMES = [
  "Power on",
  "Replay",
  "Your tag",
  "Reading",
  "Unlock",
  "Pick a side",
  "Share",
  "Your turn",
] as const;

export const SEASON = 2026;

/** Where the call to action sends people: the deployed site (SITE_URL in docker-compose.yml). */
export const SITE = "recap2026.pns.gg";
