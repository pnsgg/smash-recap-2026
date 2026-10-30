import franklin400 from "@fontsource/libre-franklin/files/libre-franklin-latin-400-normal.woff?base64";
import franklin700 from "@fontsource/libre-franklin/files/libre-franklin-latin-700-normal.woff?base64";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm?base64";
import satori from "satori";
// Japanese tags (あcola, ドラ右…): a pixel face with kana and kanji, SIL Open Font License (fonts/DotGothic16-OFL.txt).
import dotGothic from "./fonts/DotGothic16-Regular.ttf?base64";
import { pixelDataUri, pixelPath } from "../lib/pixelFont";

/**
 * The 1200×630 link preview: a title card from the cabinet. Putty bezel, dark glass with scanlines,
 * the red marquee with the wordmark, the name in the display face and one figure in the pixel digits.
 * Fonts and the rasteriser are inlined in the server build, which runs without node_modules.
 */
export const OG_SIZE = { width: 1200, height: 630 };

const C = { casing: "#cfcdc8", glass: "#0b0f0d", ink: "#e9f1ea", muted: "#a3b4a8", red: "#ff4b33", redInk: "#0b0f0d" };

export type CardContent = {
  /** Right of the wordmark in the marquee: "Player recap 2026". */
  kicker: string;
  title: string;
  figure?: { value: string; label: string; detail: string } | null;
  /** Shown instead of the figure. */
  subtitle?: string;
};

const fromBase64 = (base64: string) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

let wasmReady: Promise<void> | null = null;
let fonts: { name: string; data: ArrayBuffer; weight: 400 | 600 | 700; style: "normal" }[] | null = null;

/** Satori takes each glyph from the first listed font that has it. DotGothic16 covers both the OG
 *  display face (DOSIyagiBoldface is browser-only — its TTF is too large to inline) and Japanese tags. */
const DISPLAY = "DotGothic16";
const TEXT = "Libre Franklin, DotGothic16";

function setup() {
  wasmReady ??= initWasm(fromBase64(resvgWasm));
  fonts ??= [
    { name: "Libre Franklin", data: fromBase64(franklin400).buffer as ArrayBuffer, weight: 400, style: "normal" },
    { name: "Libre Franklin", data: fromBase64(franklin700).buffer as ArrayBuffer, weight: 700, style: "normal" },
    { name: "DotGothic16", data: fromBase64(dotGothic).buffer as ArrayBuffer, weight: 400, style: "normal" },
  ];
  return wasmReady;
}

const SCANLINES = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${1200 - 48}" height="${630 - 48}"><defs><pattern id="l" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" fill-opacity=".34"/></pattern></defs><rect width="${1200 - 48}" height="${630 - 48}" fill="url(#l)"/></svg>`,
)}`;

const titleSize = (title: string) => (title.length <= 12 ? 120 : title.length <= 18 ? 96 : title.length <= 26 ? 76 : 60);

const PIXEL = 16;
const BEZEL = 24;
const GLASS = { width: OG_SIZE.width - 2 * BEZEL, height: OG_SIZE.height - 2 * BEZEL };

function Card({ kicker, title, figure, subtitle }: CardContent) {
  return (
    <div style={{ width: OG_SIZE.width, height: OG_SIZE.height, display: "flex", padding: BEZEL, backgroundColor: C.casing }}>
      <div
        style={{
          position: "relative",
          width: GLASS.width,
          height: GLASS.height,
          display: "flex",
          flexDirection: "column",
          backgroundColor: C.glass,
          borderRadius: 44,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 96,
            padding: "0 48px",
            backgroundColor: C.red,
            color: C.redInk,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 22, height: 22, backgroundColor: C.redInk }} />
            <div style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 48, letterSpacing: -1 }}>SmashRecap</div>
          </div>
          <div style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 28 }}>{kicker}</div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "52px 56px 56px",
          }}
        >
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 400,
              fontSize: titleSize(title),
              lineHeight: 1,
              letterSpacing: -2,
              color: C.ink,
            }}
          >
            {title}
          </div>

          {figure ? (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 32 }}>
              <img
                src={pixelDataUri(figure.value, C.red, PIXEL)}
                width={pixelPath(figure.value).width * PIXEL}
                height={7 * PIXEL}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingBottom: 2 }}>
                <div style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 36, color: C.ink }}>{figure.label}</div>
                <div style={{ fontFamily: TEXT, fontWeight: 400, fontSize: 28, color: C.muted }}>
                  {figure.detail}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: TEXT, fontWeight: 400, fontSize: 34, color: C.muted, maxWidth: 820 }}>
              {subtitle}
            </div>
          )}
        </div>

        <img src={SCANLINES} width={GLASS.width} height={GLASS.height} style={{ position: "absolute", top: 0, left: 0 }} />
      </div>
    </div>
  );
}

export async function renderCard(content: CardContent): Promise<Uint8Array> {
  await setup();
  const svg = await satori(<Card {...content} />, { ...OG_SIZE, fonts: fonts! });
  return new Resvg(svg, { fitTo: { mode: "width", value: OG_SIZE.width } }).render().asPng();
}

/**
 * How a card is served. `final`: real data, cached by previews and CDNs for a week (the recap itself
 * is kept a day; numbers on a shared card may lag behind by up to a week). `pending`: the recap is
 * still being computed, so the fallback card is only cached for a minute. `not-found`: unknown account.
 */
export type CardKind = "final" | "pending" | "not-found";

const CACHE_CONTROL: Record<CardKind, string> = {
  final: `public, max-age=${7 * 24 * 60 * 60}`,
  pending: "public, max-age=60",
  "not-found": "public, max-age=3600",
};

export async function cardResponse(content: CardContent, kind: CardKind) {
  const png = await renderCard(content);
  return new Response(new Uint8Array(png), {
    status: kind === "not-found" ? 404 : 200,
    headers: { "Content-Type": "image/png", "Cache-Control": CACHE_CONTROL[kind] },
  });
}
