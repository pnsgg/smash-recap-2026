import { useEffect, useRef, useState } from "react";
import { AbsoluteFill, useDelayRender } from "remotion";
import { PixelText } from "../../compositions/PlayerRecapArcade/components/Pixel";
import { PixelImage } from "../../compositions/PlayerRecapArcade/components/PixelImage";
import { SITE } from "../../compositions/PlayerRecapArcade/acts/Continue";
import { caption, color, display, displayCase, fitDisplay, font, uncapped } from "../../compositions/PlayerRecapArcade/theme";

/** The card is laid out in design units and rendered ×2: 1920 × 2160 (docs/style_guide-recap-card.md). */
export const CARD = { width: 960, height: 1080, scale: 2 } as const;

/** Edge margin and the gap between panels, in design units. */
export const PAD = 32;
export const GAP = 12;

/**
 * "ARK | TZ | Raven" → "Raven", "SSL | | Fybusss" → "Fybusss": start.gg writes an entrant's sponsor
 * prefixes before the tag, split by "|", sometimes with an empty one.
 */
export const tagOnly = (name: string) =>
  name
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
    .pop() ?? name;

export const thousands = (n: number) => n.toLocaleString("en-US");

/**
 * A picture from start.gg, drawn as is. Holds the render until it has loaded or failed, and draws
 * nothing (or `fallback`) when it fails, so one missing logo never breaks the whole card.
 */
export const CardImg: React.FC<{ src: string | null; style?: React.CSSProperties; fallback?: React.ReactNode }> = ({
  src,
  style,
  fallback = null,
}) => {
  const [state, setState] = useState<"loading" | "ok" | "failed">(src ? "loading" : "failed");
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => (src ? delayRender(`Loading ${src}`) : null));
  const pending = useRef(handle !== null);

  useEffect(() => {
    if (!src || handle === null) return;
    const release = () => {
      if (pending.current) {
        pending.current = false;
        continueRender(handle);
      }
    };
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setState("ok");
      release();
    };
    img.onerror = () => {
      setState("failed");
      release();
    };
    img.src = src;
    return release;
  }, [src, handle, continueRender]);

  if (state === "failed") return <>{fallback}</>;
  if (state === "loading" || !src) return null;
  return <img src={src} crossOrigin="anonymous" alt="" style={{ display: "block", ...uncapped, ...style }} />;
};

/** The ground: a faint checkerboard under scanlines, the card's only CRT effect. */
const Ground: React.FC = () => (
  <svg width={CARD.width} height={CARD.height} style={{ position: "absolute", left: 0, top: 0, ...uncapped }}>
    <defs>
      <pattern id="card-checker" width={48} height={48} patternUnits="userSpaceOnUse">
        <rect width={24} height={24} fill={color.raised} />
        <rect x={24} y={24} width={24} height={24} fill={color.raised} />
      </pattern>
      <linearGradient id="card-fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color.ground} stopOpacity={0} />
        <stop offset="0.55" stopColor={color.ground} stopOpacity={0.55} />
        <stop offset="1" stopColor={color.ground} stopOpacity={0.9} />
      </linearGradient>
    </defs>
    <rect width={CARD.width} height={CARD.height} fill={color.ground} />
    <rect width={CARD.width} height={CARD.height} fill="url(#card-checker)" opacity={0.7} />
    <rect width={CARD.width} height={CARD.height} fill="url(#card-fade)" />
  </svg>
);

const Scanlines: React.FC = () => (
  <svg width={CARD.width} height={CARD.height} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", ...uncapped }}>
    <defs>
      <pattern id="card-scanlines" width={3} height={3} patternUnits="userSpaceOnUse">
        <rect y={2} width={3} height={1} fill="#000000" opacity={0.16} />
      </pattern>
    </defs>
    <rect width={CARD.width} height={CARD.height} fill="url(#card-scanlines)" />
  </svg>
);

/** The whole card: ground, content in design units scaled ×2, scanlines, and the footer. */
export const CardPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: color.ground }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: CARD.width,
        height: CARD.height,
        transform: `scale(${CARD.scale})`,
        transformOrigin: "0 0",
        overflow: "hidden",
        fontFamily: font.text,
        color: color.ink,
      }}
    >
      <Ground />
      {children}
      <div
        style={{
          position: "absolute",
          left: PAD,
          right: PAD,
          bottom: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={display(16, color.accent)}>SMASHRECAP</div>
        <div style={{ ...caption, fontSize: 14, color: color.ink }}>{SITE}</div>
      </div>
      <Scanlines />
    </div>
  </AbsoluteFill>
);

/** A square panel with a title bar: the title, and an optional note on the right. */
export const Panel: React.FC<{
  title: string;
  note?: string;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ title, note, style, bodyStyle, children }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      backgroundColor: "rgba(20,26,23,0.92)",
      border: `2px solid ${color.raised2}`,
      ...style,
    }}
  >
    <div
      style={{
        flex: "none",
        height: 36,
        display: "flex",
        alignItems: "center",
        gap: 10,
        paddingLeft: 14,
        paddingRight: 14,
        backgroundColor: color.raised2,
      }}
    >
      <div style={display(16)}>{title}</div>
      {note ? <div style={{ ...caption, fontSize: 12, marginLeft: "auto" }}>{note}</div> : null}
    </div>
    <div style={{ flex: 1, position: "relative", minHeight: 0, ...bodyStyle }}>{children}</div>
  </div>
);

/** A quiet label over a solid casing pill holding the figure, in the pixel face. */
export const Pill: React.FC<{ label: string; value: string; px?: number; fill?: string }> = ({
  label,
  value,
  px = 4,
  fill = color.casing,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <div style={{ ...caption, fontSize: 13 }}>{label}</div>
    <div
      style={{
        alignSelf: "flex-start",
        padding: `${px * 2}px ${px * 3}px`,
        backgroundColor: fill,
        boxShadow: `inset 0 -${px}px 0 ${color.casingDeep}`,
      }}
    >
      <PixelText text={value} px={px} fill={color.ground} />
    </div>
  </div>
);

/** A thin caption line used inside panels. */
export const Label: React.FC<{ children: React.ReactNode; tone?: string; style?: React.CSSProperties }> = ({
  children,
  tone = color.muted,
  style,
}) => <div style={{ ...caption, fontSize: 12, color: tone, ...style }}>{children}</div>;

let measurer: CanvasRenderingContext2D | null = null;

/**
 * `text`, cut and ended with "…" when it is wider than `width` in `cssFont`. Measured on a canvas: the
 * in-browser image renderer clips overflowing text without drawing CSS's text-overflow ellipsis.
 */
export const shorten = (text: string, cssFont: string, width: number) => {
  if (typeof document === "undefined") return text;
  measurer ??= document.createElement("canvas").getContext("2d");
  if (!measurer) return text;
  measurer.font = cssFont;
  if (measurer.measureText(text).width <= width) return text;
  const chars = [...text];
  let lo = 0;
  let hi = chars.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (measurer.measureText(`${chars.slice(0, mid).join("").trimEnd()}…`).width <= width) lo = mid;
    else hi = mid - 1;
  }
  return `${chars.slice(0, lo).join("").trimEnd()}…`;
};

/**
 * One line of text, shortened with "…" to fit `width` design units. Waits for its face to load before
 * measuring, so the cut is made with the real letter widths, and holds the render until then.
 */
export const OneLine: React.FC<{ text: string; width: number; size: number; weight?: number; tone?: string; style?: React.CSSProperties }> = ({
  text,
  width,
  size,
  weight = 800,
  tone = color.ink,
  style,
}) => {
  const cssFont = `${weight} ${size}px "Libre Franklin"`;
  const loaded = () => typeof document === "undefined" || document.fonts.check(cssFont, text);
  const [ready, setReady] = useState(loaded);
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => (ready ? null : delayRender(`Loading the face for "${text}"`)));

  useEffect(() => {
    if (ready) return;
    let live = true;
    document.fonts
      .load(cssFont, text)
      .catch(() => null)
      .then(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, [ready, cssFont, text]);

  // Released once the shortened text has been committed with the real face, not before.
  useEffect(() => {
    if (ready && handle !== null) continueRender(handle);
  }, [ready, handle, continueRender]);

  return (
    <div
      style={{
        fontFamily: font.text,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.15,
        color: tone,
        whiteSpace: "nowrap",
        overflow: "hidden",
        ...style,
      }}
    >
      {ready ? shorten(text, cssFont, width) : text}
    </div>
  );
};

/** The name, set huge with a dark outline and a hard red shadow, as the reference cards do. */
export const BigName: React.FC<{ text: string; width: number }> = ({ text, width }) => {
  const name = displayCase(text);
  const size = fitDisplay(name, 112, width);
  const edge = color.accentEdge;
  const o = size >= 80 ? 4 : 3;
  return (
    <div
      style={{
        ...display(size),
        textShadow: [
          `${o}px 0 0 ${edge}`,
          `-${o}px 0 0 ${edge}`,
          `0 ${o}px 0 ${edge}`,
          `0 -${o}px 0 ${edge}`,
          `${o * 2}px ${o * 2}px 0 ${color.accent}`,
        ].join(", "),
      }}
    >
      {name}
    </div>
  );
};

/** The framed portrait: the avatar in cabinet plastic, the main's render overlapping its lower edge. */
export const Portrait: React.FC<{
  avatarUrl: string | null;
  /** The slot on the frame's strip: "1P" for a player, "TO" for an organizer. */
  slot: string;
  caption: string | null;
  /** A render overlapping the frame's lower left edge, like a fighter stepping out of it. */
  renderUrl?: string | null;
  height: number;
}> = ({ avatarUrl, slot, caption: label, renderUrl = null, height }) => (
  <div style={{ position: "absolute", right: PAD, top: 28, width: 300, height }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: color.casing,
        boxShadow: `inset 0 -6px 0 ${color.casingDeep}, 8px 8px 0 ${color.accent}`,
        padding: 12,
        paddingBottom: 52,
      }}
    >
      <div style={{ width: "100%", height: "100%", overflow: "hidden", backgroundColor: color.raised }}>
        <CardImg src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", left: 14, right: 14, bottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={display(16, color.accent)}>{slot}</div>
        {label ? (
          <OneLine text={label} width={236} size={17} tone={color.ground} />
        ) : null}
      </div>
    </div>
    {renderUrl ? (
      // Pixelated with an outline, like the fighter in the video's character select; the other pictures stay crisp.
      <div style={{ position: "absolute", left: -120, bottom: 40, width: 232, height: 232, display: "flex", alignItems: "flex-end" }}>
        <PixelImage src={renderUrl} rows={58} maxCols={58} px={4} />
      </div>
    ) : null}
  </div>
);

