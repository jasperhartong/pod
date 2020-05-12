import { TEpisode, TEpisodeStatus } from "@/app-schema/IEpisode";
import { TPlaylist } from "@/app-schema/IPlaylist";
import * as t from "io-ts";
import { RPCMeta } from "../rpc-meta";

const reqDataRequired = t.type({
  title: t.string,
  status: TEpisodeStatus,
  image_url: t.string,
});

const reqDataOptional = t.partial({
  audio_file: TEpisode.props.audio_file,
  published_on: TEpisode.props.published_on,
});

const reqDataValidator = t.type({
  playlistId: TPlaylist.props.id,
  data: t.intersection([reqDataRequired, reqDataOptional]),
});

export default RPCMeta(
  "episode",
  "create",
  reqDataValidator,
  t.type({
    id: t.number,
  })
);
