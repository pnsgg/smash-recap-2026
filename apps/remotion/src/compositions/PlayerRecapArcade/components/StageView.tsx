import { staticFile } from "remotion";
import { color } from "../theme";
import { PixelImage } from "./PixelImage";
import { FLOOR, STAGE_COLS, STAGE_ROWS, StageDiorama, type StageMood } from "./Stage";

const ULTIMATE_ART = new Set([
  307, 308, 309, 310, 311, 312, 313, 314, 315, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330,
  331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 351, 352, 353, 354,
  355, 356, 357, 358, 359, 360, 361, 362, 363, 365, 366, 367, 368, 369, 371, 372, 373, 375, 376, 377, 378, 379, 380,
  381, 384, 385, 386, 387, 388, 389, 390, 392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406,
  407, 408, 416, 417, 484, 497, 513,
]);

const FLOOR_ROW: Record<number, number> = {
  311: 82, 484: 82, 312: 80, 328: 84, 378: 82, 377: 82, 387: 94, 397: 92, 348: 92,
  513: 82, 417: 86, 407: 104, 324: 100, 331: 86, 353: 76, 497: 82,
};
const DEFAULT_FLOOR_ROW = 84;

export const stageFloor = (stageId: string) =>
  ULTIMATE_ART.has(Number(stageId)) ? (FLOOR_ROW[Number(stageId)] ?? DEFAULT_FLOOR_ROW) / 128 : FLOOR / STAGE_ROWS;

export const stageArt = (stageId: string) =>
  ULTIMATE_ART.has(Number(stageId)) ? staticFile(`stages/ultimate/${stageId}.png`) : null;

const TINT: Partial<Record<StageMood, readonly [string, number]>> = {
  gold: [color.gold, 0.45],
  storm: [color.accentEdge, 0.6],
};

export const StageView: React.FC<{ stage: { stageId: string; stageName: string }; width: number; mood?: StageMood; frame?: number }> = ({
  stage,
  width,
  mood = "night",
  frame = 0,
}) => {
  const src = stageArt(stage.stageId);
  const height = (width * STAGE_ROWS) / STAGE_COLS;
  if (!src) return <StageDiorama stage={stage} width={width} mood={mood} frame={frame} />;
  const px = width >= 300 ? 4 : 2;
  const tint = TINT[mood];
  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", backgroundColor: color.ground }}>
      <div style={{ position: "absolute", left: "50%", top: 0, transform: "translateX(-50%)" }}>
        <PixelImage
          src={src}
          rows={Math.ceil(height / px)}
          px={px}
          mode="art"
          levels={6}
          tint={tint}
          fallback={<StageDiorama stage={stage} width={width} mood={mood} frame={frame} />}
        />
      </div>
    </div>
  );
};
