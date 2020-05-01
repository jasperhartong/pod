import * as t from "io-ts";
import { RPCMeta } from "../rpc-meta";

import { TEpisodeStatus } from "../../../app-schema/IEpisode";

const reqDataRequired = t.type({
  title: t.string,
  status: TEpisodeStatus,
  playlist: t.string,
  image_url: t.string,
});

const reqDataOptional = t.partial({
  audio_url: t.string,
});

const reqDataValidator = t.intersection([reqDataRequired, reqDataOptional]);

export default RPCMeta(
  "episode",
  "create",
  reqDataValidator,
  t.type({
    id: t.number,
  })
);
