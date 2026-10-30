import { STILL_FORMATS, type StillFormatKey } from "@video/stills/formats";
import { useEffect, useState } from "react";
import { RECAP_YEAR } from "../config";
import { canShareNatively, SHARE_TARGETS } from "../lib/share";
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

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const ratio = (width: number, height: number) => `${width / gcd(width, height)}:${height / gcd(width, height)}`;
const IMAGE_FORMATS = (Object.keys(STILL_FORMATS) as StillFormatKey[]).map((key) => ({
  key,
  label: `${STILL_FORMATS[key].platform} · ${ratio(STILL_FORMATS[key].width, STILL_FORMATS[key].height)}`,
}));

export function RecapActions({ ready, shareUrl, name, recap }: Props) {
  const [copied, setCopied] = useState(false);

  // The phone's share sheet only exists in some browsers, so it is offered after hydration.
  const [nativeShare, setNativeShare] = useState(false);
  useEffect(() => setNativeShare(canShareNatively()), []);

  const shareText = `${name}’s ${RECAP_YEAR} Smash season, replayed on SmashRecap`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      window.prompt("Copy this link", shareUrl);
    }
  };

  const shareNatively = () => navigator.share({ title: shareText, text: shareText, url: shareUrl }).catch(() => {});

  // The image is drawn in the browser by Remotion; its renderer only loads on the first click.
  const [imageFormat, setImageFormat] = useState<StillFormatKey>("x");
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
      const png = await renderRecapImage(recap, imageFormat);
      downloadBlob(png, recapImageName(recap, imageFormat));
      setImageStatus("idle");
    } catch (error) {
      console.error(error);
      setImageStatus("failed");
    }
  };

  return (
    <div className="actions">
      <div className="actions__group">
        <h2 className="actions__title">Keep it</h2>
        <div className="actions__downloads">
          <div className="actions__image">
            <label className="actions__format">
              <span className="visually-hidden">Image size for</span>
              <select
                value={imageFormat}
                onChange={(event) => setImageFormat(event.target.value as StillFormatKey)}
                disabled={!canRenderImage || rendering}
              >
                {IMAGE_FORMATS.map((format) => (
                  <option key={format.key} value={format.key}>
                    {format.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="button button--ink"
              onClick={downloadImage}
              disabled={!canRenderImage || rendering}
            >
              {imageStatus === "rendering" ? "Drawing…" : "Download image"}
            </button>
          </div>
          <button type="button" className="button" onClick={downloadVideo} disabled={!canRenderImage || rendering}>
            {videoProgress === null ? "Download video" : `Rendering ${Math.floor(videoProgress * 100)}%`}
          </button>
        </div>
        <p className="actions__status" role="status">
          {imageStatus === "failed"
            ? "The image could not be drawn. Try again."
            : videoFailed
              ? "The video could not be rendered in this browser. Try again, or use Chrome or Firefox."
              : videoProgress !== null
                ? "Rendering the video on your device. Keep this tab open."
                : ""}
        </p>
      </div>

      <div className="actions__group">
        <h2 className="actions__title">Share it</h2>
        <ul className="actions__share">
          {SHARE_TARGETS.map((target) => (
            <li key={target.id}>
              <a
                className="actions__chip"
                href={target.href(shareText, shareUrl)}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!ready}
                onClick={(event) => !ready && event.preventDefault()}
              >
                {target.label}
              </a>
            </li>
          ))}
          <li>
            <button type="button" className="actions__chip" onClick={copyLink} disabled={!ready}>
              {copied ? "Link copied" : "Copy link"}
            </button>
          </li>
          {nativeShare && (
            <li>
              <button type="button" className="actions__chip" onClick={shareNatively} disabled={!ready}>
                More…
              </button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
