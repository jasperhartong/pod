import { TStringWithFallback } from "@/utils/io-ts";
import * as t from "io-ts";
import { withFallback } from "io-ts-types/lib/withFallback";
import { IBase } from "./IBase";
import { TImageData } from "./IFileData";
import { TPlaylist } from "./IPlaylist";

export const TRoom = t.type({
  ...IBase.props,
  title: TStringWithFallback,
  cover_file: t.type({ data: TImageData }),
  // alias
  playlists: withFallback(t.array(TPlaylist), []),
});

export type IRoom = t.TypeOf<typeof TRoom>;

// Restrict updatable fields
const { uid, created_on, playlists, ...updatable } = TRoom.props;
export const TRoomUpdatable = t.partial({
  ...updatable,
});
