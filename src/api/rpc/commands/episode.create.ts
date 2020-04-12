import { RPCHandlerFactory } from "../rpc-server-handler";
import meta from "./episode.create.meta";
import { collectionsBackend } from "../../collection-storage";
import { OK } from "../../IResponse";

export default RPCHandlerFactory(meta, async (reqData) => {
  const imageUpload = await collectionsBackend.addExternalImage(
    reqData.image_url
  );
  if (!imageUpload.ok) {
    return imageUpload;
  }
  const episodeCreation = await collectionsBackend.createEpisode(
    {
      title: reqData.title,
      status: reqData.status,
      audio_file: reqData.audio_url,
    },
    reqData.playlist,
    imageUpload.data.id.toString()
  );
  if (!episodeCreation.ok) {
    return episodeCreation;
  }
  return OK(episodeCreation.data);
});
