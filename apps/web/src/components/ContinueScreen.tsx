import { useEffect, useRef, useState } from "react";
import { RECAP_YEAR } from "../config";
import { play } from "../lib/sound";
import { PixelNumber } from "./PixelNumber";
import "./ContinueScreen.css";

const START = 9;

/** The arcade's last word: a continue countdown that runs while it is on screen, then game over. */
export function ContinueScreen() {
  const ref = useRef<HTMLElement>(null);
  const [count, setCount] = useState(START);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry!.isIntersecting), { threshold: 0.55 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || count === 0) return;
    const id = window.setTimeout(() => {
      const next = count - 1;
      setCount(next);
      play(next === 0 ? "over" : "tick");
    }, 1000);
    return () => window.clearTimeout(id);
  }, [visible, count]);

  const over = count === 0;

  const restart = () => {
    play("coin");
    setCount(START);
    document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => document.querySelector<HTMLInputElement>(".console__input")?.focus({ preventScroll: true }), 700);
  };

  return (
    <section className="continue" ref={ref} aria-labelledby="continue-title">
      <h2 id="continue-title" className="continue__title">
        {over ? "Game over" : "Continue?"}
      </h2>
      <p className="continue__count" aria-live="off">
        <PixelNumber value={String(count)} label={`${count} seconds left`} />
      </p>
      <p className="continue__text">
        {over
          ? `Thanks for playing. Your ${RECAP_YEAR} recap is still one gamer tag away.`
          : `Your ${RECAP_YEAR} recap is one gamer tag away.`}
      </p>
      <button type="button" className="button" onClick={restart}>
        Find my recap
      </button>
    </section>
  );
}
