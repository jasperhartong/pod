import { RPCMeta } from "@/api/rpc/rpc-meta";
import { TRoom } from "@/app-schema/IRoom";
import * as t from "io-ts";

export default RPCMeta(
  "room",
  "all",
  t.type({
    secret: t.string,
  }),
  t.array(TRoom)
);
