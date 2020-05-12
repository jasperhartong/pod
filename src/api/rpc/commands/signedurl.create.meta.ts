import { TSignedUrl } from "@/api/file-storage/interfaces/ISignedUrl";
import * as t from "io-ts";
import { RPCMeta } from "../rpc-meta";

export default RPCMeta(
  "signedurl",
  "create",
  t.type({
    fileName: t.string,
    fileType: t.string,
  }),
  TSignedUrl
);
