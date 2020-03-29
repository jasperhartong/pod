import { IDbPlaylist } from "./IDbPlaylist";
export interface IDbRoom {
  id: number;
  slug: string;
  // alias
  playlists: IDbPlaylist[];
}
