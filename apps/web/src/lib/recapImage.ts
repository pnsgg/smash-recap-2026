import { renderStillOnWeb } from "@remotion/web-renderer";
import { CARD } from "@video/stills/card/kit";
import { OrganizerCard, ORGANIZER_CARD_ID } from "@video/stills/card/OrganizerCard";
import { PlayerCard, PLAYER_CARD_ID } from "@video/stills/card/PlayerCard";
import { DEFAULT_GAME } from "@shared";
import { RECAP_YEAR } from "../config";
import type { RecapData } from "../pages/Recap";

/**
 * Renders a recap's card in the browser and returns it as a PNG: one image for every social.
 * Browser only, and heavy: the recap page imports this module on the first click.
 */
export async function renderRecapImage(input: RecapData, signal?: AbortSignal) {
  const options = { frame: 0, licenseKey: "free-license", signal } as const;
  const size = { durationInFrames: 1, fps: 30, width: CARD.width * CARD.scale, height: CARD.height * CARD.scale };
  const still =
    input.kind === "player"
      ? await renderStillOnWeb({
          ...options,
          composition: { id: PLAYER_CARD_ID, component: PlayerCard, ...size, defaultProps: input.recap },
          inputProps: { ...input.recap, gameName: input.game.name, year: RECAP_YEAR },
        })
      : await renderStillOnWeb({
          ...options,
          composition: { id: ORGANIZER_CARD_ID, component: OrganizerCard, ...size, defaultProps: input.recap },
          inputProps: { ...input.recap, year: RECAP_YEAR },
        });
  return still.blob({ format: "png" });
}

/** `smashrecap-2026-licane.png`, `smashrecap-2026-zain-melee.png`, `smashrecap-2026-licane-organizer.png`. */
export const recapImageName = (input: RecapData) => {
  const tag = fileSafe(input.recap.gamerTag);
  const kind = input.kind === "organizer" ? "-organizer" : recapGameSuffix(input);
  return `smashrecap-${RECAP_YEAR}-${tag || "player"}${kind}.png`;
};

/** Lowercase letters, digits and dashes only, for file names. */
export const fileSafe = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[^\w-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

/** `-melee` for a player recap of any game but the default one, so downloads for two games don't collide. */
export const recapGameSuffix = (input: RecapData) =>
  input.kind === "player" && input.game.id !== DEFAULT_GAME.id ? `-${fileSafe(input.game.short)}` : "";

/** Hands a blob to the browser's download, then frees it. */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
