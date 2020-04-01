import { IDateString } from "./IDateString";

import { IFileData } from "./IFileData";

export interface IEpisode {
  id: number;
  status: "published" | "draft" | "deleted";
  created_on: IDateString;
  title: string;
  download_count: number;
  image_file: {
    data: IFileData;
  };
  audio_file: string;
}
