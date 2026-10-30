import { Composition } from "remotion";
import { Trailer, TRAILER } from "./Trailer";

// 9:16 vertical, e.g. for Instagram Reels/Stories and TikTok
export const TrailerVertical: React.FC = () => (
  <Composition id="TrailerVertical" component={Trailer} {...TRAILER} width={1080} height={1920} />
);
