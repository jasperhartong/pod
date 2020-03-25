export const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://tapes.me";

export const mediaRedirectUrl = (
  playlistId: string,
  episodeId: string,
  originalUrl: string
) =>
  `${baseUrl}/api/file-redirect?url=${originalUrl}&playlistId=${playlistId}&episodeId=${episodeId}`;

export const rssUrl = (
  profileId: string,
  scheme: string = "https",
  playlistId: string = "voorloisenrobin"
) =>
  `${baseUrl}/api/rss/${profileId}/${playlistId}`.replace(
    process.env.NODE_ENV === "production" ? "https" : "http",
    scheme
  );

export const podPageUrl = (slug: string) => `${baseUrl}/pods/${slug}`;

export const podItemPageUrl = (slug: string, itemId: string) =>
  `${baseUrl}/pods/${slug}/${itemId.toString()}`;
