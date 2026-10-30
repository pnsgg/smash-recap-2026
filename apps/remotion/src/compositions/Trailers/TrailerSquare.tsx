import { Composition } from "remotion";
import { Trailer, TRAILER } from "./Trailer";

// 1:1, e.g. for Instagram and Bluesky feeds
export const TrailerSquare: React.FC = () => (
  <Composition id="TrailerSquare" component={Trailer} {...TRAILER} width={1080} height={1080} />
);
