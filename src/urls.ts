export const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://tapes.me";

export const rssUrl = (
  protocol: string,
  host: string,
  profileId: string,
  playlistId: string = "voorloisenrobin"
) => `${protocol}//${host}/api/rss/${profileId}/${playlistId}`;

export const podPageUrl = (slug: string) => `${baseUrl}/pods/${slug}`;

export const podItemPageUrl = (slug: string, itemId: string) =>
  `${baseUrl}/pods/${slug}/${itemId.toString()}`;
