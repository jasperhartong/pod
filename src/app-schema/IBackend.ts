import { IRoom } from "./IRoom";
import { IEpisode } from "./IEpisode";
import { IFileData } from "./IFileData";
import { IResponse } from "../api/IResponse";

export interface IBackend {
  getRoomBySlug: (roomSlug: string) => Promise<IResponse<IRoom>>;
  getEpisode: (episodeId: string) => Promise<IResponse<IEpisode>>;
  createEpisode: (
    episode: Partial<IEpisode>,
    playlistId: string,
    imageFileUrl: string,
    audioFileUrl: string
  ) => Promise<IResponse<IEpisode>>;
  updateEpisode: (
    episodeId: string,
    episode: Partial<IEpisode>
  ) => Promise<IResponse<IEpisode>>;
  addExternalImage: (
    url: string
  ) => Promise<IResponse<{ file: IFileData; id: string }>>;
}
