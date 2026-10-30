import { useLayoutEffect, useRef, type ReactNode } from "react";

/** Sets the font size so the text spans its container's width exactly, measured after fonts load. */
export function FitText({ children, className = "" }: { children: ReactNode; className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text) return;

    const fit = () => {
      text.style.fontSize = "100px";
      const ratio = box.clientWidth / text.getBoundingClientRect().width;
      text.style.fontSize = `${Math.floor(100 * ratio * 1000) / 1000}px`;
    };

    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={boxRef} className={className}>
      <span ref={textRef} style={{ display: "inline-block", whiteSpace: "nowrap", lineHeight: 0.8 }}>
        {children}
      </span>
    </div>
  );
}
