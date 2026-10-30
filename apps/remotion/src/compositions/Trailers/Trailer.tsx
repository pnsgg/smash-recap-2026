import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { loadFonts } from "../../lib/fonts";
import { ArcadeMarquee } from "./components/ArcadeMarquee";
import { ControlPanel } from "./components/ControlPanel";
import { CrtGlass } from "./components/CrtGlass";
import { RasterCut } from "./components/RasterZigzagWipe";
import { TelemetryRow } from "./components/TelemetryRow";
import { CUES, cueFrames, IMPACTS, PANEL_PRESSES, STICK_THROWS } from "./cues";
import { Stage1Hello } from "./scenes/Stage1Hello";
import { Stage2Replay } from "./scenes/Stage2Replay";
import { Stage3YourTag } from "./scenes/Stage3YourTag";
import { Stage4Reading } from "./scenes/Stage4Reading";
import { Stage5Unlock } from "./scenes/Stage5Unlock";
import { Stage6PickASide } from "./scenes/Stage6PickASide";
import { Stage7Share } from "./scenes/Stage7Share";
import { Stage8YourTurn } from "./scenes/Stage8YourTurn";
import { color } from "./theme";
import { DURATION, FPS, POWER_OFF, SEASON, STAGE_NAMES, STAGES, WIPES } from "./timing";

loadFonts();

const SCENES = [Stage1Hello, Stage2Replay, Stage3YourTag, Stage4Reading, Stage5Unlock, Stage6PickASide, Stage7Share, Stage8YourTurn];

/** The wiped cuts open the three steps: STEP 01 to STEP 03. */
const CUTS = WIPES.map((at, i) => {
  const stage = STAGES.find((s) => s.from === at)!.stage;
  return { at, label: "STEP", number: i + 1, name: STAGE_NAMES[stage - 1]! };
});

/** Header comes in once the tube has settled. */
const HEADER_AT = 20;

/**
 * The SmashRecap attract-mode trailer: the cabinet greets Player 1, shows the three steps to a
 * recap and what it holds (never anyone's numbers), and ends on the address and PRESS START.
 * Loops seamlessly. One timeline for every format; the cabinet reframes to the composition's
 * aspect ratio (see layout.ts).
 */
export const Trailer: React.FC = () => {
  const frame = useCurrentFrame();
  const current = [...STAGES].reverse().find((s) => frame >= s.from) ?? STAGES[0]!;

  return (
    <AbsoluteFill style={{ backgroundColor: color.casing }}>
      <ArcadeMarquee year={SEASON} powerOff={POWER_OFF} />
      <CrtGlass impacts={IMPACTS} powerOff={POWER_OFF}>
        <TelemetryRow
          tag="You"
          stage={current.stage}
          stages={STAGES.length}
          stageName={STAGE_NAMES[current.stage - 1]!}
          stageFrom={current.from}
          from={HEADER_AT}
        />
        {SCENES.map((Scene, i) => (
          <Sequence key={i} from={STAGES[i]!.from} durationInFrames={STAGES[i]!.durationInFrames} name={STAGE_NAMES[i]}>
            <Scene />
          </Sequence>
        ))}
        <RasterCut cuts={CUTS} />
      </CrtGlass>
      <ControlPanel presses={PANEL_PRESSES} throws={STICK_THROWS} />

      <Audio src={staticFile("sfx/bed-trailer.mp3")} volume={0.5} />
      {CUES.map((cue, i) => (
        <Sequence key={i} from={cue.from} durationInFrames={cueFrames(cue.sfx)} layout="none" name={`sfx ${cue.sfx}`}>
          <Audio src={staticFile(`sfx/${cue.sfx}.wav`)} volume={() => cue.volume ?? 0.8} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** Shared by the three format compositions. */
export const TRAILER = { durationInFrames: DURATION, fps: FPS } as const;
