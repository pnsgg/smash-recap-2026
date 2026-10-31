import type { CSSProperties } from "react";
import { RECAP_YEAR } from "../config";
import { SearchConsole } from "./SearchConsole";
import { SettingsToggles } from "./SettingsToggles";
import { Wordmark } from "./Wordmark";
import "./Hero.css";

const LINES = [`Your ${RECAP_YEAR} fighting season`, "as a recap video"];

export function Hero() {
  return (
    <header className="cab">
      <div className="cab__stage">
        <div className="cab__marquee">
          <Wordmark className="cab__wordmark" />
          <nav className="cab__nav" aria-label="Main">
            <a className="link" href="#top-players">
              Top players
            </a>
          </nav>
          <SettingsToggles className="cab__toggles" />
        </div>

        <div className="cab__casing">
          <div className="cab__tube">
            <div className="cab__power glass">
              <div className="cab__picture">
                <h1 className="cab__title" aria-label={LINES.join(" ")}>
                  {LINES.map((line, i) => (
                    <span key={line} className="cab__line" aria-hidden="true">
                      <span
                        className="cab__type misconverge"
                        data-text={line}
                        style={{ "--i": i, "--chars": line.length, "--glitch-delay": `${2.2 + i * 0.15}s` } as CSSProperties}
                      >
                        {line}
                      </span>
                    </span>
                  ))}
                </h1>
                <SearchConsole variant="panel" />
              </div>
              <div className="cab__hall">
                <img
                  src="/media/hall-crt.jpg"
                  alt="Players at their setups during a Smash tournament"
                  width={1920}
                  height={1440}
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>
          <div className="cab__lip" aria-hidden="true">
            <span className="cab__led" />
            <span className="cab__speaker">
              {Array.from({ length: 7 }, (_, i) => (
                <span key={i} />
              ))}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
