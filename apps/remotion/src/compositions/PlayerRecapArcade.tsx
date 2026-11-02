import { useEffect } from "react";
import { AbsoluteFill, Composition, useCurrentFrame } from "remotion";
import type { PlayerRecapProps } from "@shared";
import { licanePlayerRecap } from "@shared/fixtures/player-recap";
import { PLAYER_RECAP_ARCADE } from "../constants";
import { loadFonts } from "../lib/fonts";
import { BonusStage } from "./PlayerRecapArcade/acts/BonusStage";
import { Challenger } from "./PlayerRecapArcade/acts/Challenger";
import { CoinLedger } from "./PlayerRecapArcade/acts/CoinLedger";
import { Continue } from "./PlayerRecapArcade/acts/Continue";
import { FinalRound } from "./PlayerRecapArcade/acts/FinalRound";
import { InsertCoin } from "./PlayerRecapArcade/acts/InsertCoin";
import { PlayerSelect } from "./PlayerRecapArcade/acts/PlayerSelect";
import { StageSelect } from "./PlayerRecapArcade/acts/StageSelect";
import { Crt } from "./PlayerRecapArcade/components/Crt";
import { preloadImages } from "./PlayerRecapArcade/components/PixelImage";
import { stageArt } from "./PlayerRecapArcade/components/StageView";
import { deriveArcade, type ArcadeData } from "./PlayerRecapArcade/data";
import { color } from "./PlayerRecapArcade/theme";
import { timeline, type Act } from "./PlayerRecapArcade/timing";

loadFonts();

export type ActProps = { t: number; frame: number; data: ArcadeData };

const SCENES: Record<Act, React.FC<ActProps>> = {
  insertCoin: InsertCoin,
  playerSelect: PlayerSelect,
  stageSelect: StageSelect,
  challenger: Challenger,
  finalRound: FinalRound,
  bonusStage: BonusStage,
  coinLedger: CoinLedger,
  continue: Continue,
};

const pictures = (d: ArcadeData) => [
  d.avatarUrl,
  ...d.fighters.flatMap((f) => [f.stockIconUrl, f.renderUrl]),
  ...[...d.stages.slice(0, 12), d.bestStage, d.worstStage].map((s) => (s ? stageArt(s.stageId) : null)),
  d.rival?.avatarUrl,
  ...d.matchups.flatMap((m) => [m.renderUrl, m.stockIconUrl]),
  ...d.bestRuns.map((r) => r.tournamentImageUrl),
  d.worstRun?.tournamentImageUrl,
  d.upset?.tournamentImageUrl,
  ...d.series.map((s) => s.imageUrl),
];

export const PlayerRecapArcadeComponent: React.FC<PlayerRecapProps> = (recap) => {
  const frame = useCurrentFrame();
  const data = deriveArcade(recap);
  // Download every picture up front: the website's player doesn't wait for them scene by scene.
  // The recap fully determines the list.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => preloadImages(pictures(data)), [recap]);
  const { acts, start, duration } = timeline(recap);
  const act = [...acts].reverse().find((name) => frame >= start[name]!) ?? "insertCoin";
  const Scene = SCENES[act];
  return (
    <Crt frame={frame} cuts={acts.slice(1).map((name) => start[name]!)} duration={duration}>
      <AbsoluteFill style={{ backgroundColor: color.ground, overflow: "hidden" }}>
        <Scene t={frame - start[act]!} frame={frame} data={data} />
      </AbsoluteFill>
    </Crt>
  );
};

export const PlayerRecapArcade: React.FC = () => (
  <Composition
    id={PLAYER_RECAP_ARCADE.id}
    component={PlayerRecapArcadeComponent}
    durationInFrames={PLAYER_RECAP_ARCADE.durationInFrames}
    fps={PLAYER_RECAP_ARCADE.fps}
    width={PLAYER_RECAP_ARCADE.width}
    height={PLAYER_RECAP_ARCADE.height}
    defaultProps={licanePlayerRecap}
    calculateMetadata={({ props }) => ({ durationInFrames: timeline(props).duration })}
  />
);
