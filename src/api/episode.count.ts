import { getEpisode, updateEpisode } from "../storage/methods";
export const domain = "episode";
export const action = "count";

export interface RequestData {
  playlistId: string;
  episodeId: string;
}

export interface ResponseData {
  ok: boolean;
}

export const handle = async (reqData: RequestData): Promise<ResponseData> => {
  if (!reqData.episodeId) {
    return { ok: false };
  }
  console.warn(`Count download for episode: ${reqData.episodeId}`);
  const { item: episode, warning } = await getEpisode(
    reqData.playlistId,
    reqData.episodeId
  );
  if (episode) {
    await updateEpisode(reqData.playlistId, reqData.episodeId, {
      download_count: episode.download_count + 1
    });
  } else {
    return { ok: false };
  }

  return { ok: true };
};
