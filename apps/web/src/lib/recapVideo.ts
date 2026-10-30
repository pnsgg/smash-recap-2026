import { canRenderMediaOnWeb, renderMediaOnWeb, type WebRendererContainer } from "@remotion/web-renderer";
import { PLAYER_RECAP_ARCADE, TOURNAMENT_ORGANIZER_RECAP_ARCADE } from "@video/constants";
import { PlayerRecapArcadeComponent } from "@video/compositions/PlayerRecapArcade";
import { TournamentOrganizerRecapArcadeComponent } from "@video/compositions/TournamentOrganizerRecapArcade";
import type { RecapData } from "../pages/Recap";
import { fileSafe, recapGameSuffix } from "./recapImage";

/**
 * Renders a recap's video in the browser, frame by frame, and returns the file. Browser only and heavy:
 * the recap page imports this module on the first click. MP4 (H.264) where the browser can encode it,
 * WebM otherwise. The recap is silent, so there is no audio track.
 */
export async function renderRecapVideo(
  input: RecapData,
  { onProgress, signal }: { onProgress: (progress: number) => void; signal?: AbortSignal },
) {
  const config = input.kind === "player" ? PLAYER_RECAP_ARCADE : TOURNAMENT_ORGANIZER_RECAP_ARCADE;
  const { width, height } = config;
  const mp4 = await canRenderMediaOnWeb({ container: "mp4", videoCodec: "h264", width, height, muted: true });
  const container: WebRendererContainer = mp4.canRender ? "mp4" : "webm";
  const videoCodec = mp4.canRender ? "h264" : "vp8";
  const options = {
    container,
    videoCodec,
    videoBitrate: "high",
    muted: true,
    licenseKey: "free-license",
    signal: signal ?? null,
    onProgress: ({ progress }: { progress: number }) => onProgress(progress),
  } as const;
  const composition = {
    id: config.id,
    durationInFrames: config.durationInFrames,
    fps: config.fps,
    width,
    height,
  };
  const result =
    input.kind === "player"
      ? await renderMediaOnWeb({
          ...options,
          composition: { ...composition, component: PlayerRecapArcadeComponent, defaultProps: input.recap },
          inputProps: input.recap,
        })
      : await renderMediaOnWeb({
          ...options,
          composition: { ...composition, component: TournamentOrganizerRecapArcadeComponent, defaultProps: input.recap },
          inputProps: input.recap,
        });
  return { blob: await result.getBlob(), extension: container };
}

/** `smashrecap-2026-licane.mp4`, `smashrecap-2026-zain-melee.mp4`, `smashrecap-2026-licane-organizer.webm`. */
export const recapVideoName = (input: RecapData, extension: string, year: number) => {
  const tag = fileSafe(input.recap.gamerTag);
  const kind = input.kind === "organizer" ? "-organizer" : recapGameSuffix(input);
  return `smashrecap-${year}-${tag || "player"}${kind}.${extension}`;
};
