import * as t from "io-ts";

import { TDateString } from "./IDateString";
import { TImageData } from "./IFileData";

export const TEpisodeStatus = t.keyof({
  // https://github.com/gcanti/io-ts#union-of-string-literals
  published: null,
  draft: null,
  deleted: null,
});

export const TEpisodeRequired = t.type({
  id: t.number,
  status: TEpisodeStatus,
  created_on: TDateString,
  title: t.string,
  image_file: t.type({ data: TImageData }),
});

export const TEpisodeOptional = t.partial({
  audio_file: t.string,
});

export const TEpisode = t.intersection([TEpisodeRequired, TEpisodeOptional]);

export type IEpisode = t.TypeOf<typeof TEpisode>;
