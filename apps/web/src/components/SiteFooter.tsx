import type { CSSProperties } from "react";
import { REPOSITORY_URL } from "../config";
import { useReveal } from "../hooks/useReveal";
import { FitText } from "./FitText";
import "./SiteFooter.css";

/** The credits roll, then the cabinet's kick plate with the name across it. */
export function SiteFooter() {
  const ref = useReveal<HTMLElement>();
  return (
    <footer className="credits" ref={ref}>
      <div className="credits__roll">
        <h2 className="credits__title" data-reveal>
          Credits
        </h2>

        <div className="credits__groups">
          <div className="credits__group" data-reveal style={{ "--i": 1 } as CSSProperties}>
            <h3>Data</h3>
            <p>
              Public tournament results from{" "}
              <a className="link" href="https://www.start.gg" target="_blank" rel="noreferrer">
                start.gg
              </a>
              , Super Smash Bros. Ultimate events only.
            </p>
          </div>
          <div className="credits__group" data-reveal style={{ "--i": 2 } as CSSProperties}>
            <h3>Video</h3>
            <p>
              Made with{" "}
              <a className="link" href="https://www.remotion.dev" target="_blank" rel="noreferrer">
                Remotion
              </a>
              .
            </p>
          </div>
          <div className="credits__group" data-reveal style={{ "--i": 3 } as CSSProperties}>
            <h3>Project</h3>
            <ul>
              <li>
                <a className="link" href={REPOSITORY_URL} target="_blank" rel="noreferrer">
                  Source on GitHub
                </a>
              </li>
              <li>
                <a className="link" href={`${REPOSITORY_URL}/issues`} target="_blank" rel="noreferrer">
                  Report a wrong number
                </a>
              </li>
              <li>
                <a className="link" href={`${REPOSITORY_URL}/blob/main/CHANGELOG.md`} target="_blank" rel="noreferrer">
                  Changelog
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="credits__legal">
        </div>
      </div>

      <div className="credits__plate">
        <FitText className="credits__name">SmashRecap</FitText>
      </div>
    </footer>
  );
}
