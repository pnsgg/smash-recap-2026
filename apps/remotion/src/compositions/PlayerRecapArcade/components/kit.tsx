import { useId } from "react";
import { interpolate, spring } from "remotion";
import { clamp, countUp, springPresets } from "../../../lib/motion";
import { FPS } from "../timing";
import { caption, color, font, uncapped } from "../theme";
import { PixelText } from "./Pixel";

export const snap = (t: number, at: number, config = springPresets.snappy) =>
  t < at ? 0 : spring({ frame: t - at, fps: FPS, config });

export const rollUp = (value: number, t: number, at: number, frames = 20) =>
  countUp(value, interpolate(t, [at, at + frames], [0, 1], clamp));

export const onGrid = (value: number, grid: number) => Math.round(value / grid) * grid;

export const Chip: React.FC<{ text: string; fill?: string; ink?: string; size?: number; style?: React.CSSProperties }> = ({
  text,
  fill = color.accent,
  ink = color.ground,
  size = 16,
  style,
}) => (
  <div
    style={{
      display: "inline-block",
      fontFamily: font.display,
      fontSize: size,
      lineHeight: 1,
      color: ink,
      backgroundColor: fill,
      padding: `${size / 4}px ${size / 2}px`,
      boxShadow: `0 ${size / 4}px 0 ${fill === color.accent ? color.accentEdge : "#050606"}`,
      ...style,
    }}
  >
    {text}
  </div>
);

export const Bevel: React.FC<{
  width: number;
  height: number;
  fill?: string;
  light?: string;
  dark?: string;
  edge?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ width, height, fill = color.raised2, light = "#2e3a33", dark = "#070a08", edge = 4, style, children }) => (
  <div
    style={{
      position: "absolute",
      width,
      height,
      boxSizing: "border-box",
      backgroundColor: fill,
      borderStyle: "solid",
      borderWidth: edge,
      borderTopColor: light,
      borderLeftColor: light,
      borderBottomColor: dark,
      borderRightColor: dark,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Figure: React.FC<{ value: string; px: number; unit?: string; fill?: string; unitColor?: string; gap?: number }> = ({
  value,
  px,
  unit,
  fill = color.ink,
  unitColor = color.muted,
  gap = 12,
}) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap }}>
    <PixelText text={value} px={px} fill={fill} />
    {unit ? <div style={{ ...caption, fontSize: 18, color: unitColor, lineHeight: 1, marginBottom: -2 }}>{unit}</div> : null}
  </div>
);

// Diagonal stripes as an SVG pattern: the in-browser video export can't draw repeating gradients.
export const Stripes: React.FC<{
  width: number;
  height: number;
  angle: number;
  period: number;
  band: number;
  fill: string;
  background?: string;
  offset?: number;
  style?: React.CSSProperties;
}> = ({ width, height, angle, period, band, fill, background, offset = 0, style }) => {
  const id = `stripes-${useId().replace(/:/g, "")}`;
  return (
    <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0, ...uncapped, ...style }}>
      <defs>
        <pattern id={id} width={period} height={period} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle}) translate(${offset % period} 0)`}>
          {background ? <rect width={period} height={period} fill={background} /> : null}
          <rect width={band} height={period} fill={fill} />
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#${id})`} />
    </svg>
  );
};

export const SpeedLines: React.FC<{ t: number; width: number; height: number; tone?: string }> = ({ t, width, height, tone = color.raised2 }) => (
  <Stripes width={width} height={height} angle={25} period={40} band={14} fill={tone} offset={t * 9} style={{ opacity: 0.9 }} />
);
