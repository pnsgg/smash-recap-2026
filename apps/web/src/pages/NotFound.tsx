import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router";
import { PixelNumber } from "../components/PixelNumber";
import { SettingsToggles } from "../components/SettingsToggles";
import { Static } from "../components/Static";
import { Wordmark } from "../components/Wordmark";
import "./NotFound.css";

/** The damage meter ticks up to 404% the way it does in game, then holds. */
function useDamage(target: number, durationMs = 900) {
  // The server renders the final figure; the count only runs in the browser, and not under reduced motion.
  const [value, setValue] = useState(target);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);
  return value;
}

export function NotFound() {
  const damage = useDamage(404);

  return (
    <div className="lost">
      <header className="lost__bar">
        <Wordmark />
        <SettingsToggles />
      </header>

      <main className="lost__main">
        <Static className="lost__snow" running={false} />
        <p className="lost__damage">
          <PixelNumber value={`${damage}%`} label="404 percent damage" />
        </p>
        <BlastZone />
        <h1 className="lost__title">
          <span className="misconverge" data-text="Past the blast zone" style={{ "--glitch-delay": "0.9s" } as CSSProperties}>
            Past the blast zone
          </span>
        </h1>
        <p className="lost__text">Nothing lives at this address on SmashRecap.</p>
        <Link className="button" to="/">
          Respawn on the home page
        </Link>
      </main>
    </div>
  );
}

/** Battlefield with its blast zone. */
function BlastZone() {
  return (
    <svg className="lost__svg" viewBox="0 0 400 270" role="img" aria-label="Battlefield stage inside its blast zone">
      <rect x="18" y="30" width="364" height="222" fill="none" stroke="var(--accent)" strokeWidth="4" strokeDasharray="10 8" />
      <polygon className="lost__platform" style={{ "--i": 0 } as CSSProperties} points="110,190 290,190 272,214 128,214" fill="var(--ink)" />
      <rect className="lost__platform" style={{ "--i": 1 } as CSSProperties} x="132" y="150" width="44" height="7" fill="var(--ink)" />
      <rect className="lost__platform" style={{ "--i": 2 } as CSSProperties} x="224" y="150" width="44" height="7" fill="var(--ink)" />
      <rect className="lost__platform" style={{ "--i": 3 } as CSSProperties} x="178" y="112" width="44" height="7" fill="var(--ink)" />
    </svg>
  );
}
