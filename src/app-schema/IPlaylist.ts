import { TStringWithFallback } from "@/utils/io-ts";
import * as t from "io-ts";
import { withFallback } from "io-ts-types/lib/withFallback";
import { IBase } from "./IBase";
import { TEpisode } from "./IEpisode";
import { TImageData } from "./IFileData";

export const TPlaylist = t.type({
  ...IBase.props,
  title: TStringWithFallback,
  description: TStringWithFallback,
  cover_file: t.type({ data: TImageData }),
  // alias
  episodes: withFallback(t.array(TEpisode), []),

  // future fields should ALWAYS be added withFallback, e.g:
  // status: withFallback(TEpisodeStatus, "draft"),
});

export type IPlaylist = t.TypeOf<typeof TPlaylist>;
