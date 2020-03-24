export const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://tapes.me";

export const rssMediaRedirectUrl = (
  playlistId: string,
  episodeId: string,
  originalUrl: string
) =>
  `${baseUrl}/api/file-redirect?url=${encodeURIComponent(
    originalUrl
  )}&amp;playlistId=${playlistId}&amp;episodeId=${episodeId}`;

export const rssUrl = (
  profileId: string,
  scheme: string = "https",
  playlistId: string = "voorloisenrobin"
) => `${baseUrl}/api/rss/${profileId}/${playlistId}`.replace("https", scheme);

export const podPageUrl = (slug: string) => `${baseUrl}/pods/${slug}`;

export const podItemPageUrl = (slug: string, itemId: string) =>
  `${baseUrl}/pods/${slug}/${itemId.toString()}`;
