import { Composition } from "remotion";
import { Trailer, TRAILER } from "./Trailer";

// 16:9 landscape, e.g. for X and YouTube
export const TrailerHorizontal: React.FC = () => (
  <Composition id="TrailerHorizontal" component={Trailer} {...TRAILER} width={1920} height={1080} />
);
