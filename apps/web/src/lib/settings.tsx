import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { setSoundEnabled } from "./sound";

type Settings = { crt: boolean; sound: boolean };
type Ctx = Settings & { toggle: (key: keyof Settings) => void };

const KEY = "smashrecap:settings";
const DEFAULTS: Settings = { crt: true, sound: false };

const SettingsContext = createContext<Ctx>({ ...DEFAULTS, toggle: () => {} });

function read(): Settings {
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Settings>) };
  } catch {
    return DEFAULTS;
  }
}

/**
 * Runs in <head> before the first paint: marks the page as scripted and applies a saved
 * "CRT effects off" so the tube texture never flashes on for someone who turned it off.
 */
export const PRE_PAINT_SCRIPT = `document.documentElement.classList.add("js");try{if(JSON.parse(localStorage.getItem("${KEY}")||"{}").crt===false)document.documentElement.classList.add("crt-off")}catch(e){}`;

/** Visitor preferences for the CRT layer and the arcade sounds, kept between visits. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  // The server cannot see the visitor's storage: render the defaults, then load what they saved.
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSettings(read());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(KEY, JSON.stringify(settings));
    document.documentElement.classList.toggle("crt-off", !settings.crt);
    setSoundEnabled(settings.sound);
  }, [settings, loaded]);

  const toggle = useCallback((key: keyof Settings) => setSettings((s) => ({ ...s, [key]: !s[key] })), []);
  const value = useMemo(() => ({ ...settings, toggle }), [settings, toggle]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
