import { useEffect, useRef } from "react";

type Props = { running?: boolean; className?: string; density?: number };

/**
 * Analogue snow, drawn into a small canvas and scaled up with crisp pixels. Shown while there is no
 * signal (loading) and for the instant of a channel change. One still frame under reduced motion.
 */
export function Static({ running = true, className = "", density = 1 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    const w = (canvas.width = Math.round(160 * density));
    const h = (canvas.height = Math.round(90 * density));
    const img = g.createImageData(w, h);
    const draw = () => {
      const px = img.data;
      for (let i = 0; i < px.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        px[i] = px[i + 1] = px[i + 2] = v;
        px[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
    };
    draw();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!running || reduced) return;
    let frame = 0;
    let last = 0;
    const loop = (t: number) => {
      if (t - last > 50) {
        draw();
        last = t;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [running, density]);

  return <canvas ref={ref} className={`static ${className}`} aria-hidden="true" />;
}
