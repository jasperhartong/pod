import { RPCMeta } from "@/api/rpc/rpc-meta";
import { TEpisode } from "@/app-schema/IEpisode";
import { TPlaylist } from "@/app-schema/IPlaylist";
import { TRoom } from "@/app-schema/IRoom";
import * as t from "io-ts";

const reqDataRequired = t.type({
  title: t.string,
  image_url: t.string,
});

const reqDataOptional = t.partial({
  audio_file: TEpisode.props.audio_file,
  published_on: TEpisode.props.published_on,
});

const reqDataValidator = t.type({
  roomUid: TRoom.props.uid,
  playlistUid: TPlaylist.props.uid,
  data: t.intersection([reqDataRequired, reqDataOptional]),
});

export default RPCMeta("episode", "create", reqDataValidator, TEpisode);
