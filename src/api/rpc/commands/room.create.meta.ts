import { RPCMeta } from "@/api/rpc/rpc-meta";
import { TRoom } from "@/app-schema/IRoom";
import * as t from "io-ts";

const reqDataRequired = t.type({
  title: t.string,
});

const reqDataValidator = t.type({
  data: reqDataRequired,
});

export default RPCMeta("room", "create", reqDataValidator, TRoom);
