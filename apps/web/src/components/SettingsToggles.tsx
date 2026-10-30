import { useSettings } from "../lib/settings";
import { play } from "../lib/sound";
import "./SettingsToggles.css";

/** Two switches every screen carries: the tube's effects and the arcade sounds. */
export function SettingsToggles({ className = "" }: { className?: string }) {
  const { crt, sound, toggle } = useSettings();
  return (
    <div className={`toggles ${className}`}>
      <button type="button" className="toggles__item" aria-pressed={crt} onClick={() => toggle("crt")}>
        <span className="toggles__led" data-on={crt} aria-hidden="true" />
        CRT effects
      </button>
      <button
        type="button"
        className="toggles__item"
        aria-pressed={sound}
        onClick={() => {
          toggle("sound");
          if (!sound) window.setTimeout(() => play("select"), 0);
        }}
      >
        <span className="toggles__led" data-on={sound} aria-hidden="true" />
        Sound
      </button>
    </div>
  );
}
