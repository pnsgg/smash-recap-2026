import { useState } from "react";
import { useNavigate } from "react-router";

type Mode = "player" | "tournament-organizer";

export const Home = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("player");
  const [slug, setSlug] = useState("");
  const [videogameId, setVideogameId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "player") {
      navigate(`/user/${encodeURIComponent(slug)}${videogameId ? `?videogameId=${encodeURIComponent(videogameId)}` : ""}`);
    } else {
      navigate(`/organizer/${encodeURIComponent(slug)}`);
    }
  };

  return (
    <div>
      <h1>Smash Recap</h1>
      <form onSubmit={handleSubmit}>
        <label>
          <input type="radio" checked={mode === "player"} onChange={() => setMode("player")} />
          Player
        </label>
        <label>
          <input
            type="radio"
            checked={mode === "tournament-organizer"}
            onChange={() => setMode("tournament-organizer")}
          />
          Tournament organizer
        </label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="start.gg user slug"
          required
        />
        {mode === "player" && (
          <input
            value={videogameId}
            onChange={(e) => setVideogameId(e.target.value)}
            placeholder="videogame id (optional)"
          />
        )}
        <button type="submit">Get recap</button>
      </form>
    </div>
  );
};
