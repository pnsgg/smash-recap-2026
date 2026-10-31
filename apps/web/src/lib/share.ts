import type { StillFormatKey } from "@video/stills/formats";

const enc = encodeURIComponent;

const HASHTAG = "#SmashRecap";

/** The socials that can open a prefilled post from a link. Instagram and Stories have no such link. */
const SHARE_INTENTS: Partial<Record<StillFormatKey, (text: string, url: string) => string>> = {
  x: (text, url) => `https://x.com/intent/post?text=${enc(`${text} ${HASHTAG}`)}&url=${enc(url)}`,
  bluesky: (text, url) => `https://bsky.app/intent/compose?text=${enc(`${text} ${HASHTAG} ${url}`)}`,
  threads: (text, url) => `https://www.threads.net/intent/post?text=${enc(`${text} ${HASHTAG} ${url}`)}`,
  // Reddit has no hashtags, and this text is the post's title.
  reddit: (text, url) => `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(text)}`,
};

export const shareIntent = (key: StillFormatKey, text: string, url: string) => SHARE_INTENTS[key]?.(text, url) ?? null;
