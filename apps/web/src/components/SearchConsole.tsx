import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useFetcher, useNavigate, useNavigation } from "react-router";
import { DEFAULT_GAME, findGame, GAMES, type Game } from "@shared";
import { recapPath, toDiscriminator, type PlayerSearchResult, type RecapKind } from "../api";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { play } from "../lib/sound";
import { displayName, formatNumber } from "../lib/stats";
import type { loader as searchLoader } from "../routes/search.players";
import "./SearchConsole.css";

const MAX_RESULTS = 20;

/** Accepts `541f04fd`, `user/541f04fd` or any start.gg profile URL and returns the discriminator. */
export function parseDiscriminator(input: string): string | null {
  const match = input.trim().match(/(?:^|user\/)([0-9a-f]{8})(?:[/?#]|$)/i);
  return match ? match[1]!.toLowerCase() : null;
}

type Props = {
  /** `panel` sits on the cabinet's control panel and opens its results upward; `compact` fits a screen. */
  variant?: "panel" | "compact";
  defaultKind?: RecapKind;
  /** The game a player recap is looked up for, until another one is picked on the landing page's panel. */
  defaultGame?: Game;
  autoFocus?: boolean;
};

/** The picker's sections: the Smash games, then the Rivals ones. */
const SERIES = [...new Set(GAMES.map((game) => game.series))].map((series) => ({
  series,
  games: GAMES.filter((game) => game.series === series),
}));

export function SearchConsole({ variant = "compact", defaultKind = "player", defaultGame = DEFAULT_GAME, autoFocus = false }: Props) {
  const navigate = useNavigate();
  const id = useId();
  const [kind, setKind] = useState<RecapKind>(defaultKind);
  const [game, setGame] = useState<Game>(defaultGame);
  const [text, setText] = useState("");
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const query = text.trim();
  const directDiscriminator = parseDiscriminator(query);
  const debounced = useDebouncedValue(query, 350);
  const searchable = debounced.length >= 2 && !parseDiscriminator(debounced);

  // The search runs on the site's own server (routes/search.players.ts); a newer load cancels the last.
  const search = useFetcher<typeof searchLoader>();
  const { load } = search;
  useEffect(() => {
    if (searchable) load(`/search/players?gamertag=${encodeURIComponent(debounced)}`);
  }, [searchable, debounced, load]);

  // Only answers for the tag on screen count, never a slower answer for an older one.
  const answer = search.data?.gamertag === debounced ? search.data : undefined;
  const results = (searchable ? (answer?.players ?? []) : []).slice(0, MAX_RESULTS);
  const waiting =
    query.length >= 2 && !directDiscriminator && (query !== debounced || search.state === "loading" || !answer);
  const listId = `${id}-results`;
  const showList = open && results.length > 0 && query === debounced;

  // Keep the option picked with the arrow keys visible inside the scrolling list.
  useEffect(() => {
    if (active >= 0) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  const go = (discriminator: string) => {
    play("coin");
    navigate(recapPath(kind, discriminator, game));
  };
  const choose = (result: PlayerSearchResult) => go(toDiscriminator(result.slug));

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!query) return inputRef.current?.focus();
    if (directDiscriminator) return go(directDiscriminator);
    const pick = results[active] ?? results[0];
    if (pick) choose(pick);
    else setOpen(true);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % results.length);
      play("blip");
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
      play("blip");
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  };

  // Shown between picking a player and the recap page appearing.
  const navigation = useNavigation();
  const opening = navigation.state === "loading" && /^\/(player|organizer)\//.test(navigation.location.pathname);

  let status: string;
  if (opening) status = "Loading the recap…";
  else if (directDiscriminator)
    status = `Opens the ${kind === "player" ? `${game.short} player` : "organiser"} recap for start.gg/user/${directDiscriminator}.`;
  else if (query.length < 2) status = "Type at least two letters of a gamer tag, or paste a start.gg profile link.";
  else if (waiting) status = "Searching start.gg…";
  else if (answer?.failed) status = "start.gg did not answer. Try again in a moment.";
  else if (searchable && results.length === 0) status = `No start.gg player found for “${query}”. Check the exact tag, or paste your profile link.`;
  else status = `${results.length} ${results.length === 1 ? "player" : "players"} found, most active first.`;

  return (
    <form className={`console console--${variant}`} onSubmit={onSubmit} role="search">
      <fieldset className="console__kinds">
        <legend className="visually-hidden">Recap type</legend>
        {(["player", "organizer"] as const).map((value) => (
          <label key={value} className="console__kind">
            <input
              type="radio"
              name={`${id}-kind`}
              value={value}
              checked={kind === value}
              onChange={() => {
                setKind(value);
                play("select");
              }}
            />
            <span>{value === "player" ? "I play" : "I run brackets"}</span>
          </label>
        ))}
      </fieldset>

      <div className={variant === "panel" ? "console__row console__row--game" : "console__row"}>
        {/* The landing page picks the game. Player recaps are per game; an organiser's counts every game they ran. */}
        {variant === "panel" && (
          <div className="console__game">
            {kind === "player" ? (
              <>
                <label className="console__label" htmlFor={`${id}-game`}>
                  Game
                </label>
                <select
                  id={`${id}-game`}
                  className="console__select"
                  value={game.id}
                  onChange={(event) => {
                    setGame(findGame(event.target.value) ?? DEFAULT_GAME);
                    play("select");
                  }}
                >
                  {SERIES.map(({ series, games }) => (
                    <optgroup key={series} label={series}>
                      {games.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.short}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </>
            ) : (
              <>
                <span className="console__label">Game</span>
                <span className="console__select console__select--all">Every game</span>
              </>
            )}
          </div>
        )}
        <div className="console__field">
          <label className="console__label" htmlFor={`${id}-input`}>
            Your start.gg gamer tag
          </label>
          <input
            id={`${id}-input`}
            ref={inputRef}
            className="console__input"
            type="text"
            inputMode="search"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            autoFocus={autoFocus}
            placeholder="Sparg0, Zomba, your tag…"
            value={text}
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
            onChange={(event) => {
              setText(event.target.value);
              setActive(-1);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
          />
        </div>
        <button className="button console__submit" type="submit">
          Find my recap
        </button>
      </div>

      <p className="console__status" aria-live="polite">
        {status}
      </p>

      <ul id={listId} className="console__results" role="listbox" hidden={!showList} aria-label="Matching start.gg players">
        {results.map((result, index) => (
          <li
            key={result.id}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={index === active}
            className="console__result"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => choose(result)}
            onMouseEnter={() => {
              if (index !== active) play("blip");
              setActive(index);
            }}
          >
            <Avatar result={result} />
            <span className="console__result-name">{displayName(result.prefix, result.gamerTag)}</span>
            <span className="console__result-meta">
              {[result.country, `${formatNumber(result.nbEvents)} events`].filter(Boolean).join(", ")}
            </span>
            <span className="console__result-id">user/{toDiscriminator(result.slug)}</span>
          </li>
        ))}
      </ul>
    </form>
  );
}

function Avatar({ result }: { result: PlayerSearchResult }) {
  const [failed, setFailed] = useState(false);
  if (!result.profilePictureUrl || failed) {
    return (
      <span className="console__avatar console__avatar--initial" aria-hidden="true">
        {result.gamerTag.slice(0, 1).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      className="console__avatar"
      src={result.profilePictureUrl}
      alt=""
      width={44}
      height={44}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
