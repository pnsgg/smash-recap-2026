const enc = encodeURIComponent;

const HASHTAG = "#SmashRecap";

/** The socials that can open a prefilled post from a link, in the order the page offers them. Instagram has no such link. */
export const SHARE_TARGETS = [
  { key: "x", platform: "X", url: (text: string, url: string) => `https://x.com/intent/post?text=${enc(`${text} ${HASHTAG}`)}&url=${enc(url)}` },
  { key: "bluesky", platform: "Bluesky", url: (text: string, url: string) => `https://bsky.app/intent/compose?text=${enc(`${text} ${HASHTAG} ${url}`)}` },
  { key: "threads", platform: "Threads", url: (text: string, url: string) => `https://www.threads.net/intent/post?text=${enc(`${text} ${HASHTAG} ${url}`)}` },
  // Reddit has no hashtags, and this text is the post's title.
  { key: "reddit", platform: "Reddit", url: (text: string, url: string) => `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(text)}` },
] as const;
