import { collectionsBackend } from "@/api/collection-storage";
import { OK } from "@/api/IResponse";
import { RPCHandlerFactory } from "../rpc-server-handler";
import meta from "./episode.update.meta";

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
