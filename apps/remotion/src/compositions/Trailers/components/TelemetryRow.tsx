import { interpolate, useCurrentFrame } from "remotion";
import { BEAT, clamp } from "../../../lib/motion";
import { useLayout } from "../layout";
import { blink, caption, color, font } from "../theme";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The cabinet's telemetry strip along the top of the glass: a blinking power LED, the 1P chip,
 * `TAG // CREDIT 01 // 120 BPM // STAGE 0N-08`, the stage name (wide cabinet only), and four beat
 * lamps stepping on the 120 BPM grid (the downbeat in red). The beam writes it in left to right
 * from `from`; the stage number flashes ink for a beat whenever it changes.
 */
export const TelemetryRow: React.FC<{
  tag: string;
  stage: number;
  stages: number;
  stageName: string;
  /** Frame the current stage began, for the flash on the number. */
  stageFrom: number;
  from: number;
  bpm?: number;
}> = ({ tag, stage, stages, stageName, stageFrom, from, bpm = 120 }) => {
  const frame = useCurrentFrame();
  const { narrow } = useLayout();
  const write = interpolate(frame, [from, from + 12], [0, 1], { ...clamp, easing: (t) => 1 - (1 - t) ** 2 });
  const beat = Math.floor(frame / BEAT) % 4;
  const fresh = frame - stageFrom < BEAT;
  const text = { ...caption, fontSize: narrow ? 24 : 28, whiteSpace: "nowrap" } as const;
  const sep = <span style={{ color: color.raised2 }}>//</span>;

  return (
    <div
      style={{
        position: "absolute",
        top: 36,
        left: narrow ? 40 : 64,
        right: narrow ? 40 : 64,
        height: 58,
        display: "flex",
        alignItems: "center",
        gap: narrow ? 14 : 18,
        borderBottom: `3px solid ${color.raised2}`,
        paddingBottom: 8,
        clipPath: `inset(0 ${(1 - write) * 100}% 0 0)`,
      }}
    >
      <div style={{ width: 16, height: 16, backgroundColor: color.accent, opacity: blink(frame) ? 1 : 0.2 }} />
      <span
        style={{
          fontFamily: font.display,
          fontWeight: 700,
          fontSize: 28,
          lineHeight: 1,
          padding: "4px 9px 3px",
          backgroundColor: color.accent,
          color: color.ground,
          boxShadow: `0 4px 0 ${color.accentEdge}`,
        }}
      >
        1P
      </span>
      <span style={{ ...text, display: "flex", gap: narrow ? 10 : 14 }}>
        <span style={{ color: color.ink }}>{tag}</span>
        {sep}
        <span>Credit 01</span>
        {sep}
        <span>{bpm} BPM</span>
        {sep}
        <span>
          Stage{" "}
          <span
            style={{
              color: fresh ? color.ground : color.ink,
              backgroundColor: fresh ? color.ink : "transparent",
              padding: "0 4px",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {pad(stage)}
          </span>
          -{pad(stages)}
        </span>
      </span>

      {narrow ? null : <span style={{ ...text, marginLeft: "auto", color: color.ink }}>{stageName}</span>}
      <div style={{ display: "flex", gap: 8, marginLeft: narrow ? "auto" : undefined }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 18,
              height: 18,
              backgroundColor: i !== beat ? color.raised2 : i === 0 ? color.accent : color.ink,
            }}
          />
        ))}
      </div>
    </div>
  );
};
