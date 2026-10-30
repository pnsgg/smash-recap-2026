import { Static } from "./Static";
import "./RecapPlayer.css";

/**
 * What the recap page shows while the player's code downloads: the same snow and cursor as the recap's own
 * loading screen. Kept out of RecapPlayer, which is the code being downloaded.
 */
export function PlayerLoading() {
  return (
    <div className="player-loading" role="status">
      <Static className="recap__snow" />
      <p className="player-label">
        LOADING CABINET
        <span className="recap__cursor" aria-hidden="true" />
      </p>
    </div>
  );
}
