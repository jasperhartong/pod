export const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://tapes.me";

export const rssMediaRedirectUrl = (slug: string, originalUrl: string) =>
  `${baseUrl}/api/file-redirect?url=${encodeURIComponent(
    originalUrl
  )}&amp;utm_source=Tapes&amp;utm_campaign=rss&amp;utm_content=${slug}`;

export const rssUrl = (slug: string, scheme: string = "https") =>
  `${baseUrl}/api/rss/${slug}`.replace("https", scheme);

export const podPageUrl = (slug: string) => `${baseUrl}/pods/${slug}`;

export const podItemPageUrl = (slug: string, itemId: string) =>
  `${baseUrl}/pods/${slug}/${itemId.toString()}`;
