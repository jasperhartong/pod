import { IDateString } from "./IDateString";

import { IImageData } from "./IFileData";

export interface IEpisode {
  id: number;
  status: "published" | "draft" | "deleted";
  created_on: IDateString;
  title: string;
  image_file: {
    data: IImageData;
  };
  audio_file: string;
}
