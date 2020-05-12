import { TRoom } from "@/app-schema/IRoom";
import * as t from "io-ts";
import { RPCMeta } from "../rpc-meta";

const reqDataValidator = t.type({
  roomId: TRoom.props.id,
  data: t.type({
    title: t.string,
    description: t.string,
    image_url: t.string,
  }),
});

export default RPCMeta(
  "playlist",
  "create",
  reqDataValidator,
  t.type({
    id: t.number,
  })
);
