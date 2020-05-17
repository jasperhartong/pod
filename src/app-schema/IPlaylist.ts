import * as t from "io-ts";
import { IBase } from "./IBase";
import { TEpisode } from "./IEpisode";
import { TImageData } from "./IFileData";

export const TPlaylist = t.type({
  ...IBase.props,
  title: t.string,
  description: t.string,
  cover_file: t.type({ data: TImageData }),
  // alias
  episodes: t.array(TEpisode),
});

export type IPlaylist = t.TypeOf<typeof TPlaylist>;
