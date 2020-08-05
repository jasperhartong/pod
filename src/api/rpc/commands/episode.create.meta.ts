import { RPCMeta } from "@/api/rpc/rpc-meta";
import { TEpisode } from "@/app-schema/IEpisode";
import { TPlaylist } from "@/app-schema/IPlaylist";
import { TRoom } from "@/app-schema/IRoom";
import { TNullableWithFallback } from "@/utils/io-ts";
import * as t from "io-ts";

const reqData = t.type({
  title: t.string,
  image_url: t.string,
  audio_file: TNullableWithFallback(TEpisode.props.audio_file),
  published_on: TNullableWithFallback(TEpisode.props.published_on),
});

const reqDataValidator = t.type({
  roomUid: TRoom.props.uid,
  playlistUid: TPlaylist.props.uid,
  data: reqData,
});

export default RPCMeta("episode", "create", reqDataValidator, TEpisode);
