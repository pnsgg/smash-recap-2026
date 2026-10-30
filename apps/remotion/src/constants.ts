import { DURATION as ARCADE_DURATION, FPS as ARCADE_FPS, SIZE as ARCADE_SIZE } from "./compositions/PlayerRecapArcade/timing";
import {
  DURATION as OPERATOR_DURATION,
  FPS as OPERATOR_FPS,
  SIZE as OPERATOR_SIZE,
} from "./compositions/TournamentOrganizerRecapArcade/timing";

/**
 * Composition settings, read by both the <Composition>s and the web app's <Player>
 * (apps/web/src/components/RecapPlayer.tsx), as in Remotion's React Router template.
 */
export const PLAYER_RECAP_ARCADE = {
  id: "PlayerRecapArcade",
  durationInFrames: ARCADE_DURATION,
  fps: ARCADE_FPS,
  width: ARCADE_SIZE,
  height: ARCADE_SIZE,
  posterFrame: 210,
} as const;

export const TOURNAMENT_ORGANIZER_RECAP_ARCADE = {
  id: "TournamentOrganizerRecapArcade",
  durationInFrames: OPERATOR_DURATION,
  fps: OPERATOR_FPS,
  width: OPERATOR_SIZE,
  height: OPERATOR_SIZE,
  posterFrame: 210,
} as const;

/** The downloadable recap images, one per platform (see stills/formats.ts). */
export { STILL_FORMATS, STILL_FORMAT_KEYS, type StillFormatKey } from "./stills/formats";
