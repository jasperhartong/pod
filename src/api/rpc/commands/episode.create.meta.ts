import * as t from "io-ts";
import { RPCMeta } from "../rpc-meta";

import { TEpisodeStatus } from "../../../app-schema/IEpisode";

export default RPCMeta(
  "episode",
  "create",
  t.type({
    title: t.string,
    status: TEpisodeStatus,
    playlist: t.string,
    audio_url: t.string,
    image_url: t.string,
  }),
  t.type({
    id: t.number,
  })
);
