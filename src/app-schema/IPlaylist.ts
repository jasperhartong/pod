import { TForcedString } from "@/utils/io-ts";
import * as t from "io-ts";
import { IBase } from "./IBase";
import { TEpisode } from "./IEpisode";
import { TImageData } from "./IFileData";

export const TPlaylist = t.type({
  ...IBase.props,
  title: TForcedString,
  description: TForcedString,
  cover_file: t.type({ data: TImageData }),
  // alias
  episodes: t.array(TEpisode),
});

export type IPlaylist = t.TypeOf<typeof TPlaylist>;
