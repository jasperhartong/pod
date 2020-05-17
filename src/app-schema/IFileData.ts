import * as t from "io-ts";

export const TImageData = t.type({
  full_url: t.string,
  //One day bring back thumbnails
});

export type IImageData = t.TypeOf<typeof TImageData>;
