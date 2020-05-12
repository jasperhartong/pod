import { collectionsBackend } from "@/api/collection-storage";
import { RPCHandlerFactory } from "../rpc-server-handler";
import meta from "./room.fetch.meta";

export default RPCHandlerFactory(meta, async (reqData) => {
  return await collectionsBackend.getRoomBySlug(reqData.slug);
});
