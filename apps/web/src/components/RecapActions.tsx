import { STILL_FORMATS, type StillFormatKey } from "@video/stills/formats";
import { useState } from "react";
import { RECAP_YEAR } from "../config";
import { shareIntent } from "../lib/share";
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

const SOCIALS = Object.keys(STILL_FORMATS) as StillFormatKey[];

export function RecapActions({ ready, shareUrl, name, recap }: Props) {
  const season = recap?.kind === "player" ? recap.game.short : "Smash";
  const shareText = `${name}’s ${RECAP_YEAR} ${season} season, replayed on SmashRecap`;

  // One flow: the social sets the image's size, the image is saved, then the post opens to attach it to.
  // The image is drawn in the browser by Remotion; its renderer only loads on the first click.
  const [social, setSocial] = useState<StillFormatKey | null>(null);
  const [savedFor, setSavedFor] = useState<StillFormatKey | null>(null);
  const [imageStatus, setImageStatus] = useState<"idle" | "rendering" | "failed">("idle");
  const canRenderImage = ready && Boolean(recap);
  const postUrl = social && shareIntent(social, shareText, shareUrl);
  const saved = social !== null && savedFor === social;

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
    if (!recap || !social) return;
    setImageStatus("rendering");
    try {
      const { renderRecapImage, recapImageName, downloadBlob } = await import("../lib/recapImage");
      const png = await renderRecapImage(recap, social);
      downloadBlob(png, recapImageName(recap, social));
      setSavedFor(social);
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
          <div className="actions__image">
            <label className="actions__format">
              <span className="visually-hidden">Social to share on</span>
              <select
                value={social ?? ""}
                onChange={(event) => setSocial(event.target.value as StillFormatKey)}
                disabled={!canRenderImage || rendering}
              >
                <option value="" disabled hidden>
                  Select a social
                </option>
                {SOCIALS.map((key) => (
                  <option key={key} value={key}>
                    {STILL_FORMATS[key].platform}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="button button--ink"
              onClick={downloadImage}
              disabled={!canRenderImage || rendering || !social}
            >
              {imageStatus === "rendering" ? "Drawing…" : "Download image"}
            </button>
          </div>
          {(postUrl || !social) && (
            <a className="button" href={saved && postUrl ? postUrl : undefined} target="_blank" rel="noreferrer" aria-disabled={!saved}>
              {social ? `Post on ${STILL_FORMATS[social].platform}` : "Post"}
            </a>
          )}
        </div>
        <p className={imageStatus === "failed" ? "actions__status actions__status--error" : "actions__status"} role="status">
          {imageStatus === "failed"
            ? "The image could not be drawn. Try again."
            : saved && !postUrl
              ? "Image saved. Post it from the app."
              : ""}
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
