import { Link } from "react-router";
import { SettingsToggles } from "../components/SettingsToggles";
import { Static } from "../components/Static";
import { Wordmark } from "../components/Wordmark";
import "./NotFound.css";

/** Shown when a page fails to render. Same screen as the 404, without the damage meter. */
export function ServerError() {
  return (
    <div className="lost">
      <header className="lost__bar">
        <Wordmark />
        <SettingsToggles />
      </header>
      <main className="lost__main">
        <Static className="lost__snow" running={false} />
        <h1 className="lost__title">Lost signal</h1>
        <p className="lost__text">This page failed to load. Try again in a moment.</p>
        <Link className="button" to="/">
          Respawn on the home page
        </Link>
      </main>
    </div>
  );
}
