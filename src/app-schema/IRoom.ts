import * as t from "io-ts";

import { TPlaylist } from "./IPlaylist";

export const TRoom = t.type({
  id: t.number,
  slug: t.string,
  // alias
  playlists: t.array(TPlaylist),
});

export type IRoom = t.TypeOf<typeof TRoom>;
