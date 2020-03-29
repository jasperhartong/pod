import { BaseRpcCommand } from "./base/base-command";
import episodeCreateMeta, {
  RequestData,
  ResponseData
} from "./episode.create.meta";
import { collectionsBackend } from "../../collection-storage";
import { OK } from "../../IResponse";

const episodeCreate = new BaseRpcCommand<RequestData, ResponseData>(
  episodeCreateMeta,
  async (req, _) => {
    const reqData: RequestData = req.body;
    console.warn(reqData);

    const audioUpload = await collectionsBackend.addExternalImage(
      reqData.audio_url
    );
    if (!audioUpload.ok) {
      return audioUpload;
    }
    const imageUpload = await collectionsBackend.addExternalImage(
      reqData.image_url
    );
    if (!imageUpload.ok) {
      return imageUpload;
    }
    const episodeCreation = await collectionsBackend.createEpisode(
      {
        title: reqData.title,
        description: reqData.description,
        status: reqData.status
      },
      reqData.playlist,
      imageUpload.data.id.toString(),
      audioUpload.data.id.toString()
    );
    if (!episodeCreation.ok) {
      return episodeCreation;
    }
    return OK(episodeCreation.data);
  }
);

export default episodeCreate;
