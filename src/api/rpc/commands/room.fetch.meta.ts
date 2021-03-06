import { RPCMeta } from "@/api/rpc/rpc-meta";
import { TRoom } from "@/app-schema/IRoom";
import * as t from "io-ts";

export default RPCMeta(
  "room",
  "fetch",
  t.type({
    uid: t.string,
  }),
  TRoom
);
