import { optional } from "@/utils/io-ts";
import * as t from "io-ts";
import { TDateString } from "./IDateString";
import { TImageData } from "./IFileData";

export const TEpisodeStatus = t.keyof({
  // https://github.com/gcanti/io-ts#union-of-string-literals
  published: null,
  draft: null,
  deleted: null,
});

export const TEpisode = t.type({
  id: t.number,
  status: TEpisodeStatus,
  created_on: TDateString,
  title: t.string,
  image_file: t.type({ data: TImageData }),
  audio_file: optional(t.string),
  published_on: optional(TDateString),
});

export const TEpisodePartial = t.partial({
  ...TEpisode.props,
});

export type IEpisode = t.TypeOf<typeof TEpisode>;
