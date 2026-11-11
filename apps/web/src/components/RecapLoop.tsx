import type { PlayerRecapProps } from "@shared";
import { Player, Thumbnail, type PlayerRef } from "@remotion/player";
import { PLAYER_RECAP_ARCADE } from "@video/constants";
import { PlayerRecapArcadeComponent } from "@video/compositions/PlayerRecapArcade";
import { timeline } from "@video/compositions/PlayerRecapArcade/timing";
import { useEffect, useRef, useState } from "react";

const FILL = { width: "100%", height: "100%" };

/**
 * A player's recap playing on a silent loop, without controls. Browser only, loaded lazily. It pauses
 * while scrolled out of view, and shows the intro's player card instead under reduced motion.
 */
export default function RecapLoop({ recap }: { recap: PlayerRecapProps }) {
  const ref = useRef<PlayerRef>(null);
  const box = useRef<HTMLDivElement>(null);
  const [still] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const video = {
    durationInFrames: timeline(recap).duration,
    fps: PLAYER_RECAP_ARCADE.fps,
    compositionWidth: PLAYER_RECAP_ARCADE.width,
    compositionHeight: PLAYER_RECAP_ARCADE.height,
  };

  // The player sizes itself when it mounts, maybe mid-way through the tube's switch-on animation (a scale).
  // Measure again once that animation is over, as the recap page does.
  useEffect(() => {
    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.target instanceof Node && box.current && event.target.contains(box.current)) {
        window.dispatchEvent(new Event("resize"));
      }
    };
    document.addEventListener("animationend", onAnimationEnd);
    return () => document.removeEventListener("animationend", onAnimationEnd);
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el || still) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) ref.current?.play();
      else ref.current?.pause();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [still]);

  return (
    <div ref={box} style={FILL}>
      {still ? (
        <Thumbnail
          component={PlayerRecapArcadeComponent}
          inputProps={recap}
          frameToDisplay={PLAYER_RECAP_ARCADE.posterFrame}
          style={FILL}
          {...video}
        />
      ) : (
        <Player
          ref={ref}
          component={PlayerRecapArcadeComponent}
          inputProps={recap}
          {...video}
          autoPlay
          loop
          initiallyMuted
          controls={false}
          clickToPlay={false}
          doubleClickToFullscreen={false}
          spaceKeyToPlayOrPause={false}
          acknowledgeRemotionLicense
          style={FILL}
        />
      )}
    </div>
  );
}
