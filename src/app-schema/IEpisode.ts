import { TNullableWithFallback, TStringWithFallback } from "@/utils/io-ts";
import * as t from "io-ts";
import { IBase } from "./IBase";
import { TDateString } from "./IDateString";
import { TImageData } from "./IFileData";

export const TEpisodeStatus = t.keyof({
  // https://github.com/gcanti/io-ts#union-of-string-literals
  published: null,
  draft: null,
  deleted: null,
});

export const TEpisode = t.type({
  ...IBase.props,
  status: TEpisodeStatus,
  title: TStringWithFallback,
  image_file: t.type({ data: TImageData }),
  audio_file: TNullableWithFallback(t.string),
  published_on: TNullableWithFallback(TDateString),
});

export type IEpisode = t.TypeOf<typeof TEpisode>;

// Restrict updatable fields
const { uid, created_on, ...updatable } = TEpisode.props;
export const TEpisodeUpdatable = t.partial({
  ...updatable,
});
