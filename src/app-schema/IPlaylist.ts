import * as t from "io-ts";

import { TEpisode } from "./IEpisode";
import { TDateString } from "./IDateString";
import { TImageData } from "./IFileData";

export const TPlaylist = t.type({
  id: t.number,
  created_on: TDateString,
  title: t.string,
  description: t.string,
  cover_file: t.type({ data: TImageData }),
  // alias
  episodes: t.array(TEpisode),
});

export type IPlaylist = t.TypeOf<typeof TPlaylist>;
