import * as t from "io-ts";

import { TPlaylist } from "./IPlaylist";
import { TImageData } from "./IFileData";

export const TRoom = t.type({
  id: t.number,
  slug: t.string,
  title: t.string,
  cover_file: t.type({ data: TImageData }),
  // alias
  playlists: t.array(TPlaylist),
});

export type IRoom = t.TypeOf<typeof TRoom>;
