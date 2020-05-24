import * as t from "io-ts";
import { TForcedString } from "./IBase";

export const TImageData = t.type({
  full_url: TForcedString,
  //One day bring back thumbnails
});

export type IImageData = t.TypeOf<typeof TImageData>;
