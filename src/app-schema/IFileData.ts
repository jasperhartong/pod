import * as t from "io-ts";

const TThumbnail = t.type({
  url: t.string,
  relative_url: t.string,
  dimension: t.string,
  width: t.number,
  height: t.number,
});

export const TImageData = t.type({
  full_url: t.string,
  // thumbnails: t.array(TThumbnail),
});

export type IImageData = t.TypeOf<typeof TImageData>;
