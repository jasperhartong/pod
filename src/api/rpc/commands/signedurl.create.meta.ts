import * as t from "io-ts";
import { RPCMeta } from "../rpc-meta";
import { TSignedUrl } from "../../file-storage/interfaces/ISignedUrl";

export default RPCMeta(
  "signedurl",
  "create",
  t.type({
    fileName: t.string,
    fileType: t.string,
  }),
  TSignedUrl
);
