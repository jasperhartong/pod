import { BaseRpcCommand } from "./base/base-command";
import { ERR } from "../../IResponse";
import { collectionsBackend } from "../../collection-storage";
import episodeCountMeta, {
  RequestData,
  ResponseData
} from "./episode.count.meta";

const episodeCount = new BaseRpcCommand<RequestData, ResponseData>(
  episodeCountMeta,
  async (req, _) => {
    const reqData = req.body;

    if (!reqData.episodeId) {
      return ERR("No EpisodeId");
    }

    console.warn(`Count download for episode: ${reqData.episodeId}`);

    const episodeRetrieval = await collectionsBackend.getEpisode(
      reqData.episodeId
    );
    if (!episodeRetrieval.ok) {
      return episodeRetrieval;
    }

    return await collectionsBackend.updateEpisode(reqData.episodeId, {
      download_count: episodeRetrieval.data.download_count + 1
    });
  }
);

export default episodeCount;
