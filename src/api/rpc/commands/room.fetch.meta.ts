import * as t from "io-ts";
import { RPCMeta } from "./base/rpc-meta";
import { TRoom } from "../../../app-schema/IRoom";

export default RPCMeta(
  "room",
  "create",
  t.type({
    slug: t.string,
  }),
  TRoom
);
