import { TForcedString } from "@/utils/io-ts";
import * as t from "io-ts";
import { IBase } from "./IBase";
import { TImageData } from "./IFileData";
import { TPlaylist } from "./IPlaylist";

export const TRoom = t.type({
  ...IBase.props,
  title: TForcedString,
  cover_file: t.type({ data: TImageData }),
  // alias
  playlists: t.array(TPlaylist),
});

export type IRoom = t.TypeOf<typeof TRoom>;
