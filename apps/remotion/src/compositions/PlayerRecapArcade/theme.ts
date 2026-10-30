export const color = {
  ground: "#0b0f0d",
  raised: "#141a17",
  raised2: "#1f2823",
  ink: "#e9f1ea",
  muted: "#a3b4a8",
  accent: "#ff4b33",
  accentStrong: "#ff6f5b",
  accentEdge: "#9e2414",
  casing: "#cfcdc8",
  casingDeep: "#b8b5ad",
  cardMuted: "#45443f",
  gold: "#ffcf3a",
  osd: "#5dff8a",
  cyan: "#46d9e6",
} as const;

export const font = {
  display: '"DOSIyagiBoldface", "Libre Franklin", sans-serif',
  text: '"Libre Franklin", sans-serif',
} as const;

export const caption = {
  fontFamily: font.text,
  fontWeight: 700,
  fontSize: 16,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: color.muted,
  whiteSpace: "nowrap",
} as const;

export const display = (size: number, fill: string = color.ink): React.CSSProperties => ({
  fontFamily: font.display,
  fontSize: size,
  lineHeight: 1,
  color: fill,
  whiteSpace: "nowrap",
});

const displayEms = (text: string) =>
  [...text].reduce((sum, ch) => sum + ((ch.codePointAt(0) ?? 0) >= 0x2e80 ? 1 : 0.5), 0);

export const fitDisplay = (text: string, max: number, width: number) => {
  const raw = width / Math.max(displayEms(text), 0.5);
  return Math.max(16, Math.min(max, Math.floor(raw / 16) * 16));
};

export const displayCase = (text: string) => text.replace(/[‘’]/g, "'").toUpperCase();

export const blink = (frame: number) => frame % 30 < 15;

export const uncapped = { maxWidth: "none", maxHeight: "none" } as const;

export const percent = (rate: number) => `${(rate * 100).toFixed(1)}%`;
