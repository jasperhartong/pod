import { IEpisode } from "./IEpisode";
import { IDateString } from "./IDateString";
import { IFileData } from "./IFileData";

export interface IPlaylist {
  id: number;
  created_on: IDateString;
  title: string;
  description: string;
  cover_file: {
    data: IFileData;
  };
  // alias
  episodes: IEpisode[];
}
