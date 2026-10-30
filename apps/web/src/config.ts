export const RECAP_YEAR = 2026;

/**
 * In the browser: the configured API, or the site's own origin (the API serves the site in production).
 * On the server (rendering a page): the API on this machine, which in production is the same process.
 */
export const API_URL: string =
  typeof window === "undefined"
    ? (process.env.API_URL ?? `http://localhost:${process.env.PORT ?? 3001}`)
    : (import.meta.env.VITE_API_URL ?? window.location.origin);

export const REPOSITORY_URL = "https://github.com/pnsgg/smash-recap-2026";
