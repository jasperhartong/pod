import { IEpisode } from "./app-schema/IEpisode";
import { IPlaylist } from "./app-schema/IPlaylist";
import { IRoom } from "./app-schema/IRoom";

export const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://tapes.me";

export const rssUrl = (protocol: string, host: string, roomUid: IRoom["uid"]) =>
  `${protocol}//${host}/api/rss/${roomUid}`;

export const roomPageUrl = (uid: IRoom["uid"]) => `${baseUrl}/rooms/${uid}`;

export const futureEpisodePage = (
  uid: IRoom["uid"],
  playlistId: IPlaylist["id"],
  episodeId: IEpisode["id"]
) => `${baseUrl}/rooms/${uid}/admin/${playlistId}/${episodeId}`;
