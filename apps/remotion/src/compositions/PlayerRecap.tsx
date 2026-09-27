import { AbsoluteFill, Composition } from "remotion";
import type { PlayerRecapProps } from "@shared";
import { licanePlayerRecap } from "@shared/fixtures/player-recap";

export const PlayerRecapComponent: React.FC<PlayerRecapProps> = () => {
  return <AbsoluteFill />;
};

export const PlayerRecap: React.FC = () => (
  <Composition
    id="PlayerRecap"
    component={PlayerRecapComponent}
    durationInFrames={150}
    fps={30}
    width={1080}
    height={1080}
    defaultProps={licanePlayerRecap}
  />
);
