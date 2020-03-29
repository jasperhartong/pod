import { IDbEpisode } from "./IDbEpisode";
import { IDbDateString } from "./common";
import { IDbFileData } from "./IDbFileData";
export interface IDbPlaylist {
  id: number;
  created_on: IDbDateString;
  title: string;
  description: string;
  cover_file: {
    data: IDbFileData;
  };
  // alias
  episodes: IDbEpisode[];
}
