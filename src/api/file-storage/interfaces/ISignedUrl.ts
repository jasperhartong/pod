import * as t from "io-ts";

export const TSignedUrl = t.type({
  uploadUrl: t.string,
  downloadUrl: t.string,
});

export type ISignedUrl = t.TypeOf<typeof TSignedUrl>;
