import { Player, Thumbnail, type PlayerRef, type RenderPoster } from "@remotion/player";
import { PLAYER_RECAP_ARCADE, TOURNAMENT_ORGANIZER_RECAP_ARCADE } from "@video/constants";
import { PlayerRecapArcadeComponent } from "@video/compositions/PlayerRecapArcade";
import { TournamentOrganizerRecapArcadeComponent } from "@video/compositions/TournamentOrganizerRecapArcade";
import { useEffect, useRef, useState } from "react";
import type { RecapData } from "../pages/Recap";
import "./RecapPlayer.css";

const FILL = { width: "100%", height: "100%" };

/** While the player waits for pictures: the frame stays visible behind a loading card. */
const Buffering: React.FC = () => (
  <div className="player-buffering" role="status">
    <div className="player-buffering__dots" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
    <p className="player-label player-label--blink">LOADING</p>
  </div>
);

type Video = { durationInFrames: number; fps: number; compositionWidth: number; compositionHeight: number };

/** Before the first play, a settled frame of the intro; while buffering, the loading card. */
const poster =
  <P extends Record<string, unknown>>(component: React.FC<P>, props: P, video: Video, frame: number): RenderPoster =>
  ({ isBuffering }) =>
    isBuffering ? (
      <Buffering />
    ) : (
      <Thumbnail component={component} inputProps={props} frameToDisplay={frame} style={FILL} {...video} />
    );

/**
 * The player with no control bar, like GitHub Unwrapped's: clicking the picture plays and pauses, and
 * whenever it isn't playing the cabinet's start button sits in the middle. Playing starts at frame 0,
 * the tube switching on.
 */
function CabinetPlayer<P extends Record<string, unknown>>({
  component,
  props,
  video,
  posterFrame,
  slot,
}: {
  component: React.FC<P>;
  props: P;
  video: Video;
  posterFrame: number;
  slot: string;
}) {
  const ref = useRef<PlayerRef>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const player = ref.current;
    if (!player) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("ended", onPause);
    return () => {
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("ended", onPause);
    };
  }, []);

  return (
    <div className="player-cabinet">
      <Player
        ref={ref}
        component={component}
        inputProps={props}
        {...video}
        controls={false}
        clickToPlay
        loop
        style={FILL}
        acknowledgeRemotionLicense
        showPosterWhenUnplayed
        showPosterWhenBuffering
        posterFillMode="player-size"
        renderPoster={poster(component, props, video, posterFrame)}
      />
      {playing ? null : (
        <button type="button" className="player-overlay" onClick={() => ref.current?.play()}>
          <span className="player-start" aria-hidden="true" />
          <span className="player-label player-label--blink">{slot} PRESS START</span>
          <span className="visually-hidden">Play the recap</span>
        </button>
      )}
    </div>
  );
}

/** The Remotion player for a recap. Browser only: the recap page loads it after hydration. */
export default function RecapPlayer({ input }: { input: RecapData }) {
  if (input.kind === "player") {
    return (
      <CabinetPlayer
        component={PlayerRecapArcadeComponent}
        props={input.recap}
        video={{
          durationInFrames: PLAYER_RECAP_ARCADE.durationInFrames,
          fps: PLAYER_RECAP_ARCADE.fps,
          compositionWidth: PLAYER_RECAP_ARCADE.width,
          compositionHeight: PLAYER_RECAP_ARCADE.height,
        }}
        posterFrame={PLAYER_RECAP_ARCADE.posterFrame}
        slot="1P"
      />
    );
  }
  return (
    <CabinetPlayer
      component={TournamentOrganizerRecapArcadeComponent}
      props={input.recap}
      video={{
        durationInFrames: TOURNAMENT_ORGANIZER_RECAP_ARCADE.durationInFrames,
        fps: TOURNAMENT_ORGANIZER_RECAP_ARCADE.fps,
        compositionWidth: TOURNAMENT_ORGANIZER_RECAP_ARCADE.width,
        compositionHeight: TOURNAMENT_ORGANIZER_RECAP_ARCADE.height,
      }}
      posterFrame={TOURNAMENT_ORGANIZER_RECAP_ARCADE.posterFrame}
      slot="TO"
    />
  );
}
