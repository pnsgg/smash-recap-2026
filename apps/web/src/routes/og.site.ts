import { RECAP_YEAR } from "../config";
import { cardResponse } from "../og/card.server";

export function loader() {
  return cardResponse(
    {
      kicker: `${RECAP_YEAR} recaps`,
      title: `Replay your ${RECAP_YEAR} season`,
      subtitle: `Every set you played or bracket you ran on start.gg in ${RECAP_YEAR}, cut into your own video.`,
    },
    "final",
  );
}
