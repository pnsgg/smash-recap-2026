export type ShareTarget = { id: string; label: string; href: (text: string, url: string) => string };

const enc = encodeURIComponent;

export const SHARE_TARGETS: ShareTarget[] = [
  { id: "x", label: "X", href: (text, url) => `https://x.com/intent/post?text=${enc(text)}&url=${enc(url)}` },
  { id: "bluesky", label: "Bluesky", href: (text, url) => `https://bsky.app/intent/compose?text=${enc(`${text} ${url}`)}` },
  { id: "threads", label: "Threads", href: (text, url) => `https://www.threads.net/intent/post?text=${enc(`${text} ${url}`)}` },
  { id: "reddit", label: "Reddit", href: (text, url) => `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(text)}` },
];

export const canShareNatively = () => typeof navigator !== "undefined" && typeof navigator.share === "function";
