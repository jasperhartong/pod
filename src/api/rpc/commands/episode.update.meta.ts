import { TEpisodePartial } from "@/app-schema/IEpisode";
import * as t from "io-ts";
import { TEpisode } from "../../../app-schema/IEpisode";
import { TPlaylist } from "../../../app-schema/IPlaylist";
import { TRoom } from "../../../app-schema/IRoom";
import { RPCMeta } from "../rpc-meta";

const reqDataValidator = t.type({
  roomUid: TRoom.props.uid,
  playlistUid: TPlaylist.props.uid,
  episodeUid: TEpisode.props.uid,
  data: TEpisodePartial,
});

// FIXME: Invalid response payload somehow..
const resDataValidator = t.type({
  TEpisode,
});

export default RPCMeta("episode", "update", reqDataValidator, resDataValidator);
