/** The trailer's palette and faces, from the SmashRecap web tokens and the brief's tube colours. */
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
  gunRed: "#ff2a3c",
  gunCyan: "#22d3ff",
  victory: "#00ff66",
  victoryDeep: "#10b981",
} as const;

export const font = {
  display: '"DOSIyagiBoldface", "Libre Franklin", sans-serif',
  text: '"Libre Franklin", sans-serif',
} as const;

/** Compact uppercase metadata, the cabinet's printed labels. */
export const caption = {
  fontFamily: font.text,
  fontWeight: 700,
  fontSize: 32,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: color.muted,
} as const;

/** The web app's `blink 1.1s steps(1)`: 33 frames at 30 fps, lit for the first half. */
export const blink = (frame: number, period = 33) => frame % period < period / 2;
