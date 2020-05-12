import { RPCHandlerFactory } from "../rpc-server-handler";
import meta from "./playlist.create.meta";
import { collectionsBackend } from "@/api/collection-storage";
import { OK } from "@/api/IResponse";

export default RPCHandlerFactory(meta, async (reqData) => {
  const imageUpload = await collectionsBackend.addExternalImage(
    reqData.data.image_url
  );
  if (!imageUpload.ok) {
    return imageUpload;
  }
  const playlistCreation = await collectionsBackend.createPlaylist(
    {
      title: reqData.data.title,
      description: reqData.data.description,
    },
    reqData.roomId.toString(),
    imageUpload.data.id.toString()
  );
  if (!playlistCreation.ok) {
    return playlistCreation;
  }
  return OK(playlistCreation.data);
});
