import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, impactShake } from "../../../lib/motion";
import { useLayout } from "../layout";
import { color } from "../theme";

const RADIUS = 40;

/**
 * Where the tube is at `frame`: the beam's horizontal and vertical deflection (0 = collapsed),
 * how hard the phosphor is driven, and whether the bright slit line is showing. The tube ignites
 * from a slit at frame 0 and dies into the same black over the last `powerOff` frames.
 */
const tube = (frame: number, offAt: number) => {
  if (frame < offAt) {
    return {
      width: interpolate(frame, [0, 4], [0, 1], { ...clamp, easing: (t) => 1 - (1 - t) ** 2 }),
      height: interpolate(frame, [4, 13], [0.004, 1], { ...clamp, easing: (t) => 1 - (1 - t) ** 3 }),
      drive: interpolate(frame, [4, 8, 22], [3, 1.6, 1], clamp),
      slit: frame >= 1 && frame < 13 ? interpolate(frame, [9, 13], [1, 0], clamp) : 0,
    };
  }
  const age = frame - offAt;
  return {
    width: interpolate(age, [8, 13], [1, 0.006], clamp),
    height: interpolate(age, [0, 8], [1, 0.004], { ...clamp, easing: (t) => t ** 2 }),
    drive: interpolate(age, [0, 8], [1, 2.6], clamp),
    slit: age >= 6 ? interpolate(age, [13, 17], [1, 0], clamp) : 0,
  };
};

/**
 * The monitor: dark curved glass set in a casing-deep bezel. The picture lives under scanlines
 * and a vignette; a faint brighter band rolls down the glass once per bar like an unsynced
 * refresh, and every impact jolts the picture and flashes the phosphor for two frames.
 */
export const CrtGlass: React.FC<{
  children: React.ReactNode;
  impacts: ReadonlyArray<number>;
  powerOff: number;
}> = ({ children, impacts, powerOff }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { cabinet } = useLayout();
  const offAt = durationInFrames - powerOff;
  const { width, height, drive, slit } = tube(frame, offAt);
  const lit = frame >= 4 && frame < offAt + 8;
  const jolt = impactShake({ frame, impacts, intensity: 12, decayFrames: 9, seed: "glass" });
  const flash = impacts.some((t) => frame - t >= 0 && frame - t < 2);
  const roll = ((frame % 60) / 60) * 130 - 15;

  return (
    <div
      style={{
        position: "absolute",
        ...cabinet.screen,
        borderRadius: RADIUS,
        overflow: "hidden",
        backgroundColor: color.ground,
        boxShadow: `0 0 0 8px ${color.casingDeep}, 0 0 0 10px ${color.casing}`,
      }}
    >
      {lit ? (
        <AbsoluteFill
          style={{
            transform: `translate(${jolt.x}px, ${jolt.y}px) scale(${1 + (drive - 1) * 0.012}) scaleY(${height})`,
            filter: drive > 1.001 ? `brightness(${drive})` : undefined,
          }}
        >
          {children}
        </AbsoluteFill>
      ) : null}

      {flash ? <AbsoluteFill style={{ backgroundColor: color.ink, opacity: 0.14 }} /> : null}

      {slit > 0 ? (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: `${width * 100}%`,
            height: 5,
            transform: "translate(-50%, -50%)",
            backgroundColor: color.ink,
            boxShadow: `0 0 30px 10px ${color.ink}aa`,
            opacity: slit,
          }}
        />
      ) : null}

      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, transparent 0px, transparent 2.5px, rgba(0,0,0,0.24) 2.5px, rgba(0,0,0,0.24) 4px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${roll}%`,
          height: "12%",
          background: `linear-gradient(180deg, transparent, ${color.ink}0a, transparent)`,
        }}
      />
      <AbsoluteFill
        style={{
          borderRadius: RADIUS,
          background: "radial-gradient(ellipse 80% 75% at 50% 48%, transparent 55%, rgba(0,0,0,0.45) 100%)",
          boxShadow: "inset 0 0 110px rgba(0,0,0,0.6), inset 0 0 18px rgba(0,0,0,0.8)",
        }}
      />
    </div>
  );
};
