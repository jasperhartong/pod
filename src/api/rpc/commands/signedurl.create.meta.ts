import { TSignedUrl } from "@/api/file-storage/interfaces/ISignedUrl";
import { RPCMeta } from "@/api/rpc/rpc-meta";
import * as t from "io-ts";

export default RPCMeta(
  "signedurl",
  "create",
  t.type({
    fileName: t.string,
    fileType: t.string,
  }),
  TSignedUrl
);
