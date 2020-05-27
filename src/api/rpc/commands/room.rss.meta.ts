import { RPCMeta } from "@/api/rpc/rpc-meta";
import * as t from "io-ts";

export default RPCMeta(
  "room",
  "rss",
  t.type({
    uid: t.string,
  }),
  t.string
);
