import { collectionsBackend } from "@/api/collection-storage";
import { OK } from "@/api/IResponse";
import { RPCHandlerFactory } from "../rpc-server-handler";
import meta from "./episode.create.meta";

export default RPCHandlerFactory(meta, async (reqData) => {
  const imageUpload = await collectionsBackend.addExternalImage(
    reqData.data.image_url
  );
  if (!imageUpload.ok) {
    return imageUpload;
  }
  const episodeCreation = await collectionsBackend.createEpisode(
    {
      title: reqData.data.title,
      status: reqData.data.status,
      audio_file: reqData.data.audio_file,
    },
    reqData.playlistId.toString(),
    imageUpload.data.id.toString()
  );
  if (!episodeCreation.ok) {
    return episodeCreation;
  }
  return OK(episodeCreation.data);
});
