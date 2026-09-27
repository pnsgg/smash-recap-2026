import "./index.css";
import { PlayerRecap } from "./compositions/PlayerRecap";
import { TournamentOrganizerRecap } from "./compositions/TournamentOrganizerRecap";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <PlayerRecap />
      <TournamentOrganizerRecap />
    </>
  );
};
