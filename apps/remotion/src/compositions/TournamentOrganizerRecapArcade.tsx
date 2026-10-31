import { useEffect } from "react";
import { AbsoluteFill, Composition, useCurrentFrame } from "remotion";
import type { TournamentOrganizerRecapProps } from "@shared";
import { licaneTournamentOrganiserRecap } from "@shared/fixtures/tournament-organiser-recap";
import { TOURNAMENT_ORGANIZER_RECAP_ARCADE } from "../constants";
import { loadFonts } from "../lib/fonts";
import { CoinLedger } from "./PlayerRecapArcade/acts/CoinLedger";
import { HiScoreContinue } from "./PlayerRecapArcade/acts/Continue";
import { Intro } from "./PlayerRecapArcade/acts/InsertCoin";
import { Crt } from "./PlayerRecapArcade/components/Crt";
import { preloadImages } from "./PlayerRecapArcade/components/PixelImage";
import { color } from "./PlayerRecapArcade/theme";
import { BiggestCrowds } from "./TournamentOrganizerRecapArcade/acts/BiggestCrowds";
import { GamesInstalled } from "./TournamentOrganizerRecapArcade/acts/GamesInstalled";
import { Series } from "./TournamentOrganizerRecapArcade/acts/Series";
import { deriveOperator, type OperatorData } from "./TournamentOrganizerRecapArcade/data";
import { ACTS, DURATION, LENGTH, START, type Act } from "./TournamentOrganizerRecapArcade/timing";

loadFonts();

type ActProps = { t: number; data: OperatorData };

const SCENES: Record<Act, React.FC<ActProps>> = {
  serviceMode: ({ t, data }) => (
    <Intro
      t={t}
      tag={data.tag}
      prefix={null}
      avatarUrl={data.avatarUrl}
      slot="TO"
      role="TOURNAMENT ORGANISER"
      subtitle={`SEASON 2026 · ${data.totalTournaments} TOURNAMENTS RUN`}
    />
  ),
  gamesInstalled: GamesInstalled,
  biggestCrowds: BiggestCrowds,
  series: Series,
  coinBox: ({ t, data }) => <CoinLedger t={t} data={{ ...data, series: [] }} />,
  continue: ({ t, data }) => (
    <HiScoreContinue
      t={t}
      length={LENGTH.continue}
      tag={data.tag}
      prefix={null}
      avatarUrl={data.avatarUrl}
      iconUrl={null}
      slot="TO"
      rows={[
        { label: "TOURNAMENTS", value: data.totalTournaments },
        { label: "EVENTS", value: data.events.total, note: `${data.events.singles} singles · ${data.events.teams} teams` },
        { label: "GAMES", value: data.games.length },
        ...(data.biggest[0] ? [{ label: "MOST ATTENDEES", value: data.biggest[0].attendees }] : []),
      ]}
    />
  ),
};

const CUTS = ACTS.slice(1).map((act) => START[act]);

export const TournamentOrganizerRecapArcadeComponent: React.FC<TournamentOrganizerRecapProps> = (recap) => {
  const frame = useCurrentFrame();
  const data = deriveOperator(recap);
  // Download every picture up front: the website's player doesn't wait for them scene by scene.
  useEffect(
    () =>
      preloadImages([
        data.avatarUrl,
        ...data.games.map((g) => g.imageUrl),
        ...data.biggest.map((b) => b.tournamentImageUrl),
        ...data.series.map((s) => s.imageUrl),
      ]),
    // The recap fully determines the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recap],
  );
  const act = [...ACTS].reverse().find((name) => frame >= START[name]) ?? "serviceMode";
  const Scene = SCENES[act];
  return (
    <Crt frame={frame} cuts={CUTS} duration={DURATION}>
      <AbsoluteFill style={{ backgroundColor: color.ground, overflow: "hidden" }}>
        <Scene t={frame - START[act]} data={data} />
      </AbsoluteFill>
    </Crt>
  );
};

export const TournamentOrganizerRecapArcade: React.FC = () => (
  <Composition
    id={TOURNAMENT_ORGANIZER_RECAP_ARCADE.id}
    component={TournamentOrganizerRecapArcadeComponent}
    durationInFrames={TOURNAMENT_ORGANIZER_RECAP_ARCADE.durationInFrames}
    fps={TOURNAMENT_ORGANIZER_RECAP_ARCADE.fps}
    width={TOURNAMENT_ORGANIZER_RECAP_ARCADE.width}
    height={TOURNAMENT_ORGANIZER_RECAP_ARCADE.height}
    defaultProps={licaneTournamentOrganiserRecap}
  />
);
