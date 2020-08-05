import { RPCMeta } from "@/api/rpc/rpc-meta";
import { TPlaylist } from "@/app-schema/IPlaylist";
import { TRoom } from "@/app-schema/IRoom";
import * as t from "io-ts";

const reqDataValidator = t.type({
  roomUid: TRoom.props.uid,
  data: t.type({
    title: t.string,
    description: t.string,
    image_url: t.string,
  }),
});

export default RPCMeta("playlist", "create", reqDataValidator, TPlaylist);
