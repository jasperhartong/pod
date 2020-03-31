import { IDbDateString } from "./IDbDateString";

import { IDbFileData } from "./IDbFileData";
export interface IDbEpisode {
  id: number;
  status: "published" | "draft" | "deleted";
  created_on: IDbDateString;
  title: string;
  description: string;
  download_count: number;
  image_file: {
    data: IDbFileData;
  };
  audio_file: string;
}
