import { RPCMeta } from "@/api/rpc/rpc-meta";
import { TEpisode, TEpisodeUpdatable } from "@/app-schema/IEpisode";
import { TPlaylist } from "@/app-schema/IPlaylist";
import { TRoom } from "@/app-schema/IRoom";
import * as t from "io-ts";

const reqDataValidator = t.type({
  roomUid: TRoom.props.uid,
  playlistUid: TPlaylist.props.uid,
  episodeUid: TEpisode.props.uid,
  data: TEpisodeUpdatable,
});

export default RPCMeta("episode", "update", reqDataValidator, TEpisode);
