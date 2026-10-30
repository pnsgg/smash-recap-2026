import { AbsoluteFill } from "remotion";
import { Chip } from "../../compositions/PlayerRecapArcade/components/kit";
import { PixelImage } from "../../compositions/PlayerRecapArcade/components/PixelImage";
import { PixelText } from "../../compositions/PlayerRecapArcade/components/Pixel";
import { SITE } from "../../compositions/PlayerRecapArcade/acts/Continue";
import { caption, color, display, displayCase, fitDisplay, font, uncapped } from "../../compositions/PlayerRecapArcade/theme";
import type { StillFormatKey } from "../formats";


export const WIDTH = 1080;
const PAD = 40;
const GAP = 20;
const FOOTER = 120;

const SAFE: Record<StillFormatKey, { top: number; bottom: number }> = {
  x: { top: 0, bottom: 0 },
  bluesky: { top: 0, bottom: 0 },
  threads: { top: 0, bottom: 0 },
  reddit: { top: 0, bottom: 0 },
  instagram: { top: 0, bottom: 0 },
  story: { top: 150, bottom: 230 },
};

export const PANELS: Record<StillFormatKey, { count: number; header: number }> = {
  bluesky: { count: 4, header: 380 },
  x: { count: 6, header: 380 },
  threads: { count: 6, header: 380 },
  reddit: { count: 6, header: 380 },
  instagram: { count: 6, header: 460 },
  story: { count: 6, header: 620 },
};

const Scanlines: React.FC<{ height: number }> = ({ height }) => (
  <svg width={WIDTH} height={height} style={{ position: "absolute", left: 0, top: 0, ...uncapped }}>
    <defs>
      <pattern id="still-scanlines" width={4} height={4} patternUnits="userSpaceOnUse">
        <rect y={3} width={4} height={1} fill="#000000" opacity={0.22} />
      </pattern>
    </defs>
    <rect width={WIDTH} height={height} fill="url(#still-scanlines)" />
  </svg>
);

const Header: React.FC<{
  height: number;
  top: number;
  avatarUrl: string | null;
  slot: string;
  role: string;
  prefix: string | null;
  tag: string;
  subtitle: string;
}> = ({ height, top, avatarUrl, slot, role, prefix, tag, subtitle }) => {
  const name = displayCase(tag);
  return (
    <div style={{ position: "absolute", left: 0, top, width: WIDTH, height, overflow: "hidden", backgroundColor: color.raised }}>
      <div style={{ position: "absolute", left: 0, top: (height - WIDTH) / 2 - 60 }}>
        <PixelImage
          src={avatarUrl}
          rows={68}
          px={16}
          mode="photo"
          levels={6}
          fallback={
            <div style={{ width: WIDTH, height: WIDTH, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PixelText text="1" px={60} fill={color.accentEdge} />
            </div>
          }
        />
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(11,15,13,0.4)" }} />
      <div style={{ position: "absolute", left: PAD, top: 32, display: "flex", alignItems: "center", gap: 18 }}>
        <Chip text={slot} size={32} />
        <div style={display(32)}>{role}</div>
      </div>
      <div style={{ position: "absolute", right: PAD, top: 40, ...display(32, color.gold) }}>SMASHRECAP 2026</div>
      <div
        style={{
          position: "absolute",
          left: -40,
          right: -40,
          bottom: 24,
          height: 236,
          backgroundColor: color.accent,
          borderBottom: `12px solid ${color.accentEdge}`,
          transform: "rotate(-3deg)",
        }}
      />
      <div style={{ position: "absolute", left: PAD + 10, bottom: 52, transform: "rotate(-3deg)", transformOrigin: "left bottom" }}>
        {prefix ? <div style={display(32, color.ground)}>{displayCase(prefix)}</div> : null}
        <div style={{ ...display(fitDisplay(name, 96, WIDTH - 2 * PAD - 40)), marginTop: 4 }}>{name}</div>
        <div style={{ fontFamily: font.text, fontWeight: 800, fontSize: 26, letterSpacing: "0.06em", color: color.ground, marginTop: 8 }}>{subtitle}</div>
      </div>
    </div>
  );
};

const Footer: React.FC<{ top: number }> = ({ top }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top,
      width: WIDTH,
      height: FOOTER,
      backgroundColor: color.accent,
      borderTop: `8px solid ${color.accentEdge}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: `0 ${PAD}px`,
      boxSizing: "border-box",
    }}
  >
    <div style={{ fontFamily: font.text, fontWeight: 800, fontSize: 30, letterSpacing: "0.06em", color: color.ground }}>GET YOUR OWN RECAP</div>
    <div style={display(48, color.ink)}>{SITE}</div>
  </div>
);

export const Panel: React.FC<{ label: string; tone?: string; width: number; height: number; children: React.ReactNode }> = ({
  label,
  tone = color.muted,
  width,
  height,
  children,
}) => (
  <div
    style={{
      position: "relative",
      width,
      height,
      boxSizing: "border-box",
      backgroundColor: color.raised2,
      borderStyle: "solid",
      borderWidth: 6,
      borderTopColor: "#2e3a33",
      borderLeftColor: "#2e3a33",
      borderBottomColor: "#070a08",
      borderRightColor: "#070a08",
      overflow: "hidden",
    }}
  >
    <div style={{ ...caption, fontSize: 22, color: tone, position: "absolute", left: 22, top: 18 }}>{label}</div>
    {children}
  </div>
);

export const StillFigure: React.FC<{ value: string; px: number; unit?: string; fill?: string }> = ({ value, px, unit, fill = color.ink }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
    <PixelText text={value} px={px} fill={fill} />
    {unit ? <div style={{ ...caption, fontSize: 22, lineHeight: 1, marginBottom: -2 }}>{unit}</div> : null}
  </div>
);

export type PanelSpec = {
  key: string;
  wide?: boolean;
  render: (size: { width: number; height: number }) => React.ReactNode;
};

export const StillPage: React.FC<{
  format: StillFormatKey;
  height: number;
  header: Omit<React.ComponentProps<typeof Header>, "height" | "top">;
  panels: PanelSpec[];
}> = ({ format, height, header, panels }) => {
  const safe = SAFE[format];
  const { count, header: headerHeight } = PANELS[format];
  const chosen = panels.slice(0, count);
  const columnWidth = (WIDTH - 2 * PAD - GAP) / 2;
  // Lay the panels out in rows of two; a lone panel or a wide one takes a row to itself.
  const rows: PanelSpec[][] = [];
  for (const p of chosen) {
    const last = rows[rows.length - 1];
    if (!p.wide && last && last.length === 1 && !last[0]!.wide) last.push(p);
    else rows.push([p]);
  }
  const gridTop = safe.top + headerHeight + PAD;
  const gridBottom = height - safe.bottom - FOOTER - PAD;
  const rowHeight = (gridBottom - gridTop - GAP * (rows.length - 1)) / Math.max(1, rows.length);

  return (
    <AbsoluteFill style={{ backgroundColor: color.ground }}>
      <Header height={headerHeight} top={safe.top} {...header} />
      {rows.map((row, r) =>
        row.map((p, c) => {
          const width = row.length === 1 ? WIDTH - 2 * PAD : columnWidth;
          return (
            <div key={p.key} style={{ position: "absolute", left: PAD + c * (columnWidth + GAP), top: gridTop + r * (rowHeight + GAP) }}>
              {p.render({ width, height: rowHeight })}
            </div>
          );
        }),
      )}
      <Footer top={height - safe.bottom - FOOTER} />
      <Scanlines height={height} />
    </AbsoluteFill>
  );
};
