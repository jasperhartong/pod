import { RPCHandlerFactory } from "../rpc-server-handler";
import meta from "./episode.update.meta";
import { collectionsBackend } from "@/api/collection-storage";
import { OK } from "@/api/IResponse";

export default RPCHandlerFactory(meta, async (reqData) => {
  const episodeCreation = await collectionsBackend.updateEpisode(
    reqData.id.toString(),
    reqData.data
  );
  if (!episodeCreation.ok) {
    return episodeCreation;
  }
  return OK(episodeCreation.data);
});
