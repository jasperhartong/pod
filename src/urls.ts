import { IEpisode } from "./app-schema/IEpisode";
import { IPlaylist } from "./app-schema/IPlaylist";
import { IRoom } from "./app-schema/IRoom";

export const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://tapes.me";

export const rssUrl = (
  protocol: string,
  host: string,
  roomSlug: IRoom["slug"]
) => `${protocol}//${host}/api/rss/${roomSlug}`;

export const roomPageUrl = (slug: IRoom["slug"]) => `${baseUrl}/rooms/${slug}`;

export const futureEpisodePage = (
  slug: IRoom["slug"],
  playlistId: IPlaylist["id"],
  episodeId: IEpisode["id"]
) => `${baseUrl}/rooms/${slug}/admin/${playlistId}/${episodeId}`;
