import { useState } from "react";
import { RECAP_YEAR } from "../config";
import { SHARE_TARGETS } from "../lib/share";
import type { RecapData } from "../pages/Recap";
import "./RecapActions.css";

type Props = {
  /** Sharing is offered once the recap is there. */
  ready: boolean;
  /** The recap's public address, the same on the server and in the browser. */
  shareUrl: string;
  name: string;
  /** The loaded recap, player or organizer, for the downloadable image. */
  recap?: RecapData;
};

export function RecapActions({ ready, shareUrl, name, recap }: Props) {
  const season = recap?.kind === "player" ? recap.game.short : "Smash";
  const shareText = `${name}’s ${RECAP_YEAR} ${season} season, replayed on SmashRecap`;

  // One flow: the card is saved, then a post opens to attach it to. One image fits every social.
  // The image is drawn in the browser by Remotion; its renderer only loads on the first click.
  const [saved, setSaved] = useState(false);
  const [imageStatus, setImageStatus] = useState<"idle" | "rendering" | "failed">("idle");
  const canRenderImage = ready && Boolean(recap);

  // The video is rendered in the browser too, frame by frame; it takes a while, so the button shows progress.
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const rendering = imageStatus === "rendering" || videoProgress !== null;

  const downloadVideo = async () => {
    if (!recap) return;
    setVideoFailed(false);
    setVideoProgress(0);
    try {
      const [{ renderRecapVideo, recapVideoName }, { downloadBlob }] = await Promise.all([
        import("../lib/recapVideo"),
        import("../lib/recapImage"),
      ]);
      const { blob, extension } = await renderRecapVideo(recap, { onProgress: setVideoProgress });
      downloadBlob(blob, recapVideoName(recap, extension, RECAP_YEAR));
    } catch (error) {
      console.error(error);
      setVideoFailed(true);
    } finally {
      setVideoProgress(null);
    }
  };

  const downloadImage = async () => {
    if (!recap) return;
    setImageStatus("rendering");
    try {
      const { renderRecapImage, recapImageName, downloadBlob } = await import("../lib/recapImage");
      const png = await renderRecapImage(recap);
      downloadBlob(png, recapImageName(recap));
      setSaved(true);
      setImageStatus("idle");
    } catch (error) {
      console.error(error);
      setImageStatus("failed");
    }
  };

  return (
    <div className="actions">
      <div className="actions__group">
        <h2 className="actions__title">Share on social media</h2>
        <div className="actions__downloads">
          <button type="button" className="button button--ink" onClick={downloadImage} disabled={!canRenderImage || rendering}>
            {imageStatus === "rendering" ? "Drawing…" : "Download image"}
          </button>
          <div className="actions__posts">
            {SHARE_TARGETS.map((target) => (
              <a
                key={target.key}
                className="button"
                href={saved ? target.url(shareText, shareUrl) : undefined}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!saved}
              >
                Post on {target.platform}
              </a>
            ))}
          </div>
        </div>
        <p className={imageStatus === "failed" ? "actions__status actions__status--error" : "actions__status"} role="status">
          {imageStatus === "failed"
            ? "The image could not be drawn. Try again."
            : saved
              ? "Image saved. Attach it to your post, or post it from the Instagram app."
              : "Download the image first, then post it."}
        </p>
      </div>

      <div className="actions__group">
        <h2 className="actions__title">Keep the video</h2>
        <button type="button" className="button button--ink" onClick={downloadVideo} disabled={!canRenderImage || rendering}>
          {videoProgress === null ? "Download video" : `Rendering ${Math.floor(videoProgress * 100)}%`}
        </button>
        <p className={videoFailed ? "actions__status actions__status--error" : "actions__status"} role="status">
          {videoFailed
            ? "The video could not be rendered in this browser. Try again, or use Chrome or Firefox."
            : videoProgress !== null
              ? "Rendering the video on your device. Keep this tab open."
              : ""}
        </p>
      </div>
    </div>
  );
}
