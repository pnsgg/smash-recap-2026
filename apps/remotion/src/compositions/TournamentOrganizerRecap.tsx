import { AbsoluteFill, Composition } from "remotion";
import type { TournamentOrganizerRecapProps } from "@shared";
import { licaneTournamentOrganiserRecap } from "@shared/fixtures/tournament-organiser-recap";

const TournamentOrganizerRecapComponent: React.FC<
  TournamentOrganizerRecapProps
> = () => {
  return <AbsoluteFill />;
};

export const TournamentOrganizerRecap: React.FC = () => (
  <Composition
    id="TournamentOrganizerRecap"
    component={TournamentOrganizerRecapComponent}
    durationInFrames={150}
    fps={30}
    width={1080}
    height={1080}
    defaultProps={licaneTournamentOrganiserRecap}
  />
);
