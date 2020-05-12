import * as t from "io-ts";
import { RPCMeta } from "../rpc-meta";

import { TEpisodePartial } from "@/app-schema/IEpisode";

const reqDataValidator = t.type({
  id: TEpisodePartial.props.id,
  data: TEpisodePartial,
});

const resDataValidator = t.type({
  id: t.number,
});

export default RPCMeta("episode", "update", reqDataValidator, resDataValidator);
