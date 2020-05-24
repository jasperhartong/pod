import { TStringWithFallback } from "@/utils/io-ts";
import * as t from "io-ts";

export const TImageData = t.type({
  full_url: TStringWithFallback,
  //One day bring back thumbnails
});

export type IImageData = t.TypeOf<typeof TImageData>;
