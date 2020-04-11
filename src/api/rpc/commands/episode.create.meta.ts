import * as t from "io-ts";
import { RPCMeta } from "./base/rpc-meta";

import { TEpisode, TEpisodeStatus } from "../../../app-schema/IEpisode";

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
  // TODO: Currently fails on validation here, Directus is not returning the episode with embedded stuff..
  TEpisode
);
