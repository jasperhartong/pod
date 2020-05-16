import { TRoom } from "@/app-schema/IRoom";
import * as t from "io-ts";
import { RPCMeta } from "../rpc-meta";

export default RPCMeta(
  "room",
  "fetch",
  t.type({
    uid: t.string,
  }),
  TRoom
);
