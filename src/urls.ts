import { IRoom } from "./app-schema/IRoom";
import { IEpisode } from "./app-schema/IEpisode";

export const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://tapes.me";

export const rssUrl = (
  protocol: string,
  host: string,
  roomSlug: IRoom["slug"],
  playlistId: string = "voorloisenrobin"
) => `${protocol}//${host}/api/rss/${roomSlug}/${playlistId}`;

export const roomPageUrl = (slug: IRoom["slug"]) => `${baseUrl}/rooms/${slug}`;

export const futureEpisodePage = (
  slug: IRoom["slug"],
  episodeId: IEpisode["id"]
) => `${baseUrl}/pods/${slug}/${episodeId.toString()}`;
