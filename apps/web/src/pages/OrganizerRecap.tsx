import { Player } from "@remotion/player";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { TournamentOrganizerRecapComponent } from "@video/compositions/TournamentOrganizerRecap";
import { fetchTournamentOrganizerRecap } from "../api";
import { VIDEO_CONFIG } from "../videoConfig";

export const OrganizerRecap = () => {
  const { slug = "" } = useParams();

  const {
    data: recap,
    error,
  } = useQuery({
    queryKey: ["organizer-recap", slug],
    queryFn: () => fetchTournamentOrganizerRecap(slug),
  });

  return (
    <div>
      <Link to="/">Back</Link>
      {error && <p>{error.message}</p>}
      {!recap && !error && <p>Your recap is loading...</p>}
      {recap && (
        <Player component={TournamentOrganizerRecapComponent} inputProps={recap} controls {...VIDEO_CONFIG} />
      )}
    </div>
  );
};
