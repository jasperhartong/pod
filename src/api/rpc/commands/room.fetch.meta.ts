import * as t from "io-ts";
import { RPCMeta } from "../rpc-meta";
import { TRoom } from "../../../app-schema/IRoom";

export default RPCMeta(
  "room",
  "fetch",
  t.type({
    slug: t.string,
  }),
  TRoom
);
