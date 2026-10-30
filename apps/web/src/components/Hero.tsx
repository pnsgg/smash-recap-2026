import type { CSSProperties } from "react";
import { RECAP_YEAR } from "../config";
import { SearchConsole } from "./SearchConsole";
import { SettingsToggles } from "./SettingsToggles";
import { Wordmark } from "./Wordmark";
import "./Hero.css";

const LINES = ["Replay your", `${RECAP_YEAR} season`];

/**
 * The home page's cabinet: a lit marquee, the attract screen, and the control panel where you type
 * your tag. Scrolling on switches the tube off.
 */
export function Hero() {
  return (
    <header className="cab">
      <div className="cab__stage">
        <div className="cab__marquee">
          <Wordmark className="cab__wordmark" />
          <nav className="cab__nav" aria-label="Main">
            <a className="link" href="#whats-counted">
              What’s counted
            </a>
            <a className="link" href="#top-players">
              Top players
            </a>
          </nav>
          <SettingsToggles className="cab__toggles" />
        </div>

        <div className="cab__screen">
          <div className="cab__tube">
            <div className="cab__power">
            <div className="cab__backdrop">
              <img
                src="/media/hall-crt.jpg"
                alt="Players at their setups during a Smash tournament"
                width={1920}
                height={1440}
                fetchPriority="high"
              />
            </div>

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

              <div className="cab__info">
                <ul className="cab__facts">
                  <li>Every Smash, both Rivals</li>
                  <li>Every start.gg event of&nbsp;{RECAP_YEAR}</li>
                  <li>For players and organisers</li>
                </ul>
                <div className="cab__copy">
                  <p className="cab__lead">
                    SmashRecap reads every set you played or bracket you ran on start.gg this year and turns it into
                    your own recap video.
                  </p>
                  <p className="cab__attract blink">Type your gamer tag on the panel below to start</p>
                </div>
              </div>
            </div>
            </div>
          </div>
          <div className="cab__flash" aria-hidden="true" />
        </div>

        <div className="cab__panel">
          <SearchConsole variant="panel" />
        </div>
      </div>
    </header>
  );
}
