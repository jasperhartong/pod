import { NextApiRequest, NextApiResponse } from "next";
import { IResponse, ERR } from "../IResponse";
import { IDbEpisode } from "../collection-storage/interfaces/IDbEpisode";
import { collectionsBackend } from "../collection-storage";

export const domain = "episode";
export const action = "count";

export interface RequestData {
  playlistId: string;
  episodeId: string;
}

export type ResponseData = IResponse<IDbEpisode>;

export const handle = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<ResponseData> => {
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
};
