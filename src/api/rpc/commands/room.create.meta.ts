import { RPCMeta } from "@/api/rpc/rpc-meta";
import { TRoom } from "@/app-schema/IRoom";
import * as t from "io-ts";

const roomDataRequired = t.type({
  title: t.string,
});

const reqDataValidator = t.type({
  secret: t.string,
  data: roomDataRequired,
});

export default RPCMeta("room", "create", reqDataValidator, TRoom);
