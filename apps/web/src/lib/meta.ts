import type { MetaDescriptor } from "react-router";

type PageMeta = { title: string; description: string; url: string; image: string; imageAlt: string };

/** Title, description and the Open Graph / Twitter tags link previews read. */
export function pageMeta({ title, description, url, image, imageAlt }: PageMeta): MetaDescriptor[] {
  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "SmashRecap" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: imageAlt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
}

/**
 * The public origin for absolute URLs in link previews. Set SITE_URL in production when the app
 * sits behind a proxy that terminates HTTPS; otherwise the request's own origin is used.
 */
export const siteOrigin = (request: Request) =>
  (process.env.SITE_URL ?? new URL(request.url).origin).replace(/\/$/, "");
