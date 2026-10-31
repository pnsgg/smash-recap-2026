import { Folder } from "remotion";
import "./index.css";
import { PlayerRecapArcade } from "./compositions/PlayerRecapArcade";
import { TournamentOrganizerRecapArcade } from "./compositions/TournamentOrganizerRecapArcade";
import { OrganizerArcadeStills } from "./stills/arcade/OrganizerArcadeStills";
import { PlayerArcadeStills } from "./stills/arcade/PlayerArcadeStills";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="OneCredit">
        <PlayerRecapArcade />
        <TournamentOrganizerRecapArcade />
        <Folder name="still-images">
          <PlayerArcadeStills />
          <OrganizerArcadeStills />
        </Folder>
      </Folder>
    </>
  );
};
