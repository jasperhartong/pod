import { IPlaylist } from "./IPlaylist";

export interface IRoom {
  id: number;
  slug: string;
  // alias
  playlists: IPlaylist[];
}
