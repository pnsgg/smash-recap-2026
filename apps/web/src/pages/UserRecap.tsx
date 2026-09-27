import { Player } from "@remotion/player";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useSearchParams } from "react-router";
import { PlayerRecapComponent } from "@video/compositions/PlayerRecap";
import { fetchPlayerRecap } from "../api";
import { VIDEO_CONFIG } from "../videoConfig";

export const UserRecap = () => {
  const { slug = "" } = useParams();
  const [searchParams] = useSearchParams();
  const videogameId = searchParams.get("videogameId") ?? "";

  const {
    data: recap,
    error,
  } = useQuery({
    queryKey: ["player-recap", slug, videogameId],
    queryFn: () => fetchPlayerRecap(slug, videogameId),
  });

  return (
    <div>
      <Link to="/">Back</Link>
      {error && <p>{error.message}</p>}
      {!recap && !error && <p>Your recap is loading...</p>}
      {recap && <Player component={PlayerRecapComponent} inputProps={recap} controls {...VIDEO_CONFIG} />}
    </div>
  );
};
