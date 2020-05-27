import { RPCMeta } from "@/api/rpc/rpc-meta";
import { TRoom } from "@/app-schema/IRoom";
import * as t from "io-ts";

const roomData = t.partial({
  title: TRoom.props.title,
  cover_file: TRoom.props.cover_file,
});

const reqDataValidator = t.type({
  data: roomData,
});

export default RPCMeta("room", "create", reqDataValidator, TRoom);
