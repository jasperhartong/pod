export const domain = "episode";
export const action = "count";

export interface RequestData {
  playlistId: string;
  episodeId: string;
}

export interface ResponseData {
  ok: boolean;
}

export const handle = (reqData: RequestData): ResponseData => {
  if (!reqData.episodeId) {
    return { ok: false };
  }
  console.warn(`Count download for episode: ${reqData.episodeId}`);
  return { ok: true };
};
