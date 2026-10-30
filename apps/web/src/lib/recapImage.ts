import { renderStillOnWeb } from "@remotion/web-renderer";
import { STILL_FORMATS, type StillFormatKey } from "@video/constants";
import { ORGANIZER_ARCADE_STILL_COMPONENTS, organizerArcadeStillId } from "@video/stills/arcade/OrganizerArcadeStills";
import { PLAYER_ARCADE_STILL_COMPONENTS, playerArcadeStillId } from "@video/stills/arcade/PlayerArcadeStills";
import { RECAP_YEAR } from "../config";
import type { RecapData } from "../pages/Recap";

/**
 * Renders a recap's image for one platform in the browser and returns it as a PNG.
 * Browser only, and heavy: the recap page imports this module on the first click.
 */
export async function renderRecapImage(input: RecapData, key: StillFormatKey, signal?: AbortSignal) {
  const { width, height } = STILL_FORMATS[key];
  const options = { frame: 0, licenseKey: "free-license", signal } as const;
  const still =
    input.kind === "player"
      ? await renderStillOnWeb({
          ...options,
          composition: {
            id: playerArcadeStillId(key),
            component: PLAYER_ARCADE_STILL_COMPONENTS[key],
            durationInFrames: 1,
            fps: 30,
            width,
            height,
            defaultProps: input.recap,
          },
          inputProps: input.recap,
        })
      : await renderStillOnWeb({
          ...options,
          composition: {
            id: organizerArcadeStillId(key),
            component: ORGANIZER_ARCADE_STILL_COMPONENTS[key],
            durationInFrames: 1,
            fps: 30,
            width,
            height,
            defaultProps: input.recap,
          },
          inputProps: input.recap,
        });
  return still.blob({ format: "png" });
}

/** `smashrecap-2026-licane-x.png`, `smashrecap-2026-licane-organizer-x.png`: safe as a file name. */
export const recapImageName = (input: RecapData, key: StillFormatKey) => {
  const tag = input.recap.gamerTag
    .normalize("NFKD")
    .replace(/[^\w-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  const kind = input.kind === "organizer" ? "-organizer" : "";
  return `smashrecap-${RECAP_YEAR}-${tag || "player"}${kind}-${key}.png`;
};

/** Hands a blob to the browser's download, then frees it. */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
