import { IRoom } from "./IRoom";
import { IEpisode } from "./IEpisode";
import { IImageData } from "./IFileData";
import { IResponse } from "../api/IResponse";

export interface IBackend {
  getRoomBySlug: (roomSlug: string) => Promise<IResponse<IRoom>>;
  getEpisode: (episodeId: string) => Promise<IResponse<IEpisode>>;
  createEpisode: (
    episode: Partial<IEpisode>,
    playlistId: string,
    imageFileUrl: string,
    audioFileUrl: string
  ) => Promise<IResponse<{ id: IEpisode["id"] }>>;
  updateEpisode: (
    episodeId: string,
    episode: Partial<IEpisode>
  ) => Promise<IResponse<{ id: IEpisode["id"] }>>;
  addExternalImage: (
    url: string
  ) => Promise<IResponse<{ file: IImageData; id: string }>>;
}
