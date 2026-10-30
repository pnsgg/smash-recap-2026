import { useCallback, useEffect, useRef, useState } from "react";
import { Img, useBufferState, useDelayRender } from "remotion";
import { uncapped } from "../theme";

export type PixelMode = "sprite" | "photo" | "art" | "tint" | "shadow";

type Recipe = {
  src: string;
  rows: number;
  maxCols: number | null;
  mode: PixelMode;
  levels: number;
  outline: string | null;
  ramp: readonly string[];
  px: number;
  tint: readonly [string, number] | null;
};

type Baked = { url: string; width: number; height: number };

const hex = (value: string) => [1, 3, 5].map((i) => Number.parseInt(value.slice(i, i + 2), 16)) as [number, number, number];

const sources = new Map<string, Promise<HTMLImageElement>>();

const loadImage = (src: string) => {
  let job = sources.get(src);
  if (!job) {
    job = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Could not load ${src}`));
      img.src = src;
    });
    // A failed download may succeed on the next try.
    job.catch(() => sources.delete(src));
    sources.set(src, job);
  }
  return job;
};

const PRELOAD_AT_ONCE = 2;

export const preloadImages = (urls: ReadonlyArray<string | null | undefined>) => {
  if (typeof document === "undefined") return;
  const queue = [...new Set(urls.filter((url): url is string => Boolean(url)))];
  const next = (): Promise<void> | undefined => {
    const url = queue.shift();
    return url === undefined ? undefined : loadImage(url).catch(() => null).then(next);
  };
  for (let i = 0; i < PRELOAD_AT_ONCE; i++) next();
};

const downscale = (source: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, w: number, h: number) => {
  let canvas = document.createElement("canvas");
  let cw = sw;
  let ch = sh;
  canvas.width = cw;
  canvas.height = ch;
  canvas.getContext("2d")!.drawImage(source, sx, sy, sw, sh, 0, 0, cw, ch);
  while (cw / 2 >= w && ch / 2 >= h) {
    const next = document.createElement("canvas");
    next.width = Math.round(cw / 2);
    next.height = Math.round(ch / 2);
    const ctx = next.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(canvas, 0, 0, next.width, next.height);
    canvas = next;
    cw = next.width;
    ch = next.height;
  }
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(canvas, 0, 0, w, h);
  return out;
};

const opaqueBounds = (img: HTMLImageElement) => {
  const probe = 256;
  const scale = probe / Math.max(img.naturalWidth, img.naturalHeight);
  const pw = Math.max(1, Math.round(img.naturalWidth * scale));
  const ph = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = pw;
  canvas.height = ph;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, pw, ph);
  const { data } = ctx.getImageData(0, 0, pw, ph);
  let x0 = pw;
  let y0 = ph;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < ph; y++) {
    for (let x = 0; x < pw; x++) {
      if (data[(y * pw + x) * 4 + 3]! > 24) {
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x);
        y1 = Math.max(y1, y);
      }
    }
  }
  if (x1 < 0) return { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
  return { x: x0 / scale, y: y0 / scale, w: (x1 - x0 + 1) / scale, h: (y1 - y0 + 1) / scale };
};

const bake = async ({ src, rows, maxCols, mode, levels, outline, ramp, px, tint }: Recipe): Promise<Baked> => {
  const img = await loadImage(src);
  const photo = mode === "photo" || mode === "art";
  const box = mode === "art"
    ? { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight }
    : photo
    ? (() => {
        const side = Math.min(img.naturalWidth, img.naturalHeight);
        return { x: (img.naturalWidth - side) / 2, y: (img.naturalHeight - side) / 2, w: side, h: side };
      })()
    : opaqueBounds(img);
  const tooWide = maxCols !== null && (rows * box.w) / box.h > maxCols;
  const h = tooWide ? Math.max(1, Math.round((maxCols * box.h) / box.w)) : rows;
  const w = Math.max(1, Math.round((h * box.w) / box.h));
  const small = downscale(img, box.x, box.y, box.w, box.h, w, h);
  const pixels = small.getContext("2d")!.getImageData(0, 0, w, h).data;

  // One pixel of margin all round, for the outline.
  const pad = outline && !photo ? 1 : 0;
  const W = w + pad * 2;
  const H = h + pad * 2;
  const out = document.createElement("canvas");
  out.width = W;
  out.height = H;
  const ctx = out.getContext("2d")!;
  const image = ctx.createImageData(W, H);
  const dst = image.data;
  const solid = new Uint8Array(W * H);
  const step = 255 / (levels - 1);
  const rampRgb = ramp.map(hex);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (!photo && pixels[i + 3]! < 110) continue;
      const o = ((y + pad) * W + x + pad) * 4;
      solid[(y + pad) * W + x + pad] = 1;
      const [r, g, b] = [pixels[i]!, pixels[i + 1]!, pixels[i + 2]!];
      let rgb: [number, number, number];
      if (mode === "shadow") {
        rgb = rampRgb[0]!;
      } else if (mode === "tint") {
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        rgb = rampRgb[Math.min(rampRgb.length - 1, Math.floor(lum * rampRgb.length))]!;
      } else {
        rgb = [r, g, b].map((c) => Math.round(Math.round(c / step) * step)) as [number, number, number];
      }
      if (tint) {
        const [tr, tg, tb] = hex(tint[0]);
        const k = tint[1];
        rgb = [
          Math.round(rgb[0] * (1 - k + (k * tr) / 255)),
          Math.round(rgb[1] * (1 - k + (k * tg) / 255)),
          Math.round(rgb[2] * (1 - k + (k * tb) / 255)),
        ];
      }
      dst[o] = rgb[0];
      dst[o + 1] = rgb[1];
      dst[o + 2] = rgb[2];
      dst[o + 3] = 255;
    }
  }

  if (pad && outline) {
    const [r, g, b] = hex(outline);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (solid[y * W + x]) continue;
        const near =
          (x > 0 && solid[y * W + x - 1]) ||
          (x < W - 1 && solid[y * W + x + 1]) ||
          (y > 0 && solid[(y - 1) * W + x]) ||
          (y < H - 1 && solid[(y + 1) * W + x]);
        if (!near) continue;
        const o = (y * W + x) * 4;
        dst[o] = r;
        dst[o + 1] = g;
        dst[o + 2] = b;
        dst[o + 3] = 255;
      }
    }
  }

  ctx.putImageData(image, 0, 0);
  // Blown up here, block by block, rather than by the browser: crisp in the video and in the image export.
  const big = document.createElement("canvas");
  big.width = W * px;
  big.height = H * px;
  const bigCtx = big.getContext("2d")!;
  bigCtx.imageSmoothingEnabled = false;
  bigCtx.drawImage(out, 0, 0, big.width, big.height);
  return { url: big.toDataURL("image/png"), width: big.width, height: big.height };
};

const cache = new Map<string, Promise<Baked>>();
const done = new Map<string, Baked>();

const bakeOnce = (recipe: Recipe) => {
  const key = JSON.stringify(recipe);
  let job = cache.get(key);
  if (!job) {
    job = bake(recipe).then((baked) => {
      done.set(key, baked);
      return baked;
    });
    cache.set(key, job);
  }
  return { key, job };
};

const DETAIL = 0.75;

const DEFAULT_RAMP = { tint: ["#1a0705", "#9e2414", "#ff4b33", "#ff6f5b", "#ffd2c9"], shadow: ["#050606"] } as const;

export const PixelImage: React.FC<{
  src: string | null;
  rows: number;
  maxCols?: number;
  px: number;
  mode?: PixelMode;
  levels?: number;
  outline?: string | null;
  ramp?: readonly string[];
  tint?: readonly [string, number];
  flip?: boolean;
  fallback?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ src, rows: askedRows, maxCols: askedCols, px: askedPx, mode = "sprite", levels = 5, outline = "#050606", ramp, tint, flip = false, fallback = null, style }) => {
  // Blocks a quarter smaller than asked, with more rows to keep the same size on screen: a touch more detail.
  const px = Math.max(2, Math.round(askedPx * DETAIL));
  const rows = Math.round((askedRows * askedPx) / px);
  const maxCols = askedCols === undefined ? undefined : Math.round((askedCols * askedPx) / px);
  const recipe: Recipe | null = src
    ? {
        src,
        rows,
        maxCols: maxCols ?? null,
        mode,
        levels,
        outline: mode === "photo" || mode === "art" ? null : outline,
        ramp: ramp ?? (mode === "tint" ? DEFAULT_RAMP.tint : mode === "shadow" ? DEFAULT_RAMP.shadow : []),
        px,
        tint: tint ?? null,
      }
    : null;
  const key = recipe ? JSON.stringify(recipe) : null;
  const [baked, setBaked] = useState<Baked | null>(() => (key ? (done.get(key) ?? null) : null));
  const [failed, setFailed] = useState(false);
  // Held from mount until the sprite has been drawn, so no frame is captured with a hole in it. The hook's
  // handle belongs to this render: the in-browser image export waits on it, not on the global one.
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => (recipe ? delayRender(`Baking sprite ${recipe.src}`) : null));
  const pending = useRef(handle !== null);

  const release = useCallback(() => {
    if (pending.current && handle !== null) {
      pending.current = false;
      continueRender(handle);
    }
  }, [handle, continueRender]);

  useEffect(() => {
    if (!recipe || baked) return;
    let live = true;
    bakeOnce(recipe)
      .job.then((result) => {
        if (live) setBaked(result);
      })
      .catch((error) => {
        console.error(error);
        if (live) setFailed(true);
        release();
      });
    return () => {
      live = false;
    };
    // The recipe is fully described by its key; it is a new object on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => release, [release]);

  // In the website's player, pause on a picture that isn't ready rather than play past an empty box.
  // Outside a player (the image export) there is no buffer to pause, and the call throws.
  const buffer = useBufferState();
  const waiting = recipe !== null && !baked && !failed;
  useEffect(() => {
    if (!waiting) return;
    let block: { unblock: () => void } | null = null;
    try {
      block = buffer.delayPlayback();
    } catch {
      return;
    }
    return () => block?.unblock();
  }, [waiting, buffer]);

  if (!recipe || failed) return <>{fallback}</>;
  if (!baked) return <div style={{ width: rows * px, height: rows * px, ...style }} />;
  return (
    <Img
      src={baked.url}
      onLoad={release}
      onError={release}
      width={baked.width}
      height={baked.height}
      style={{
        ...uncapped,
        width: baked.width,
        height: baked.height,
        display: "block",
        imageRendering: "pixelated",
        transform: flip ? "scaleX(-1)" : undefined,
        ...style,
      }}
    />
  );
};
