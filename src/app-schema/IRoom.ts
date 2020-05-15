import * as t from "io-ts";
import { optional } from "../utils/io-ts";
import { TImageData } from "./IFileData";
import { TPlaylist } from "./IPlaylist";

export const TRoom = t.type({
  id: t.number,
  uid: optional(t.string),
  slug: t.string,
  title: t.string,
  cover_file: t.type({ data: TImageData }),
  // alias
  playlists: t.array(TPlaylist),
});

export type IRoom = t.TypeOf<typeof TRoom>;
