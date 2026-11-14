import { Folder } from "remotion";
import "./index.css";
import { PlayerRecapArcade } from "./compositions/PlayerRecapArcade";
import { TournamentOrganizerRecapArcade } from "./compositions/TournamentOrganizerRecapArcade";
import { OrganizerCardStill } from "./stills/card/OrganizerCard";
import { PlayerCardStill } from "./stills/card/PlayerCard";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="OneCredit">
        <PlayerRecapArcade />
        <TournamentOrganizerRecapArcade />
        <Folder name="still-images">
          <PlayerCardStill />
          <OrganizerCardStill />
        </Folder>
      </Folder>
    </>
  );
};
