import { NextApiResponse, NextApiRequest } from "next";
import { IDbEpisode } from "../collection-storage/interfaces/IDbEpisode";
import { IResponse, OK } from "../IResponse";
import { collectionsBackend } from "../collection-storage";

export const domain = "episode";
export const action = "create";

export interface RequestData {
  title: string;
  description: string;
  status: IDbEpisode["status"];
  playlist: string;
  audio_url: string;
  image_url: string;
}

export type ResponseData = IResponse<IDbEpisode>;

export const handle = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<ResponseData> => {
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
};
