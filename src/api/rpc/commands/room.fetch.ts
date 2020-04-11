import meta from "./room.fetch.meta";

import { RPCHandlerFactory } from "./base/rpc-handler";
import { collectionsBackend } from "../../collection-storage";

export default RPCHandlerFactory(meta, async (reqData) => {
  return await collectionsBackend.getRoomBySlug(reqData.slug);
});
