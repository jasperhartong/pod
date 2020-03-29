import { IDbRoom } from "../interfaces/IDbRoom";
import { IDbEpisode } from "../interfaces/IDbEpisode";
import { IDbFileData } from "../interfaces/IDbFileData";
import { IResponse } from "../../IResponse";
import { BackendBase } from "../backends/base";

export interface ITapesMeBackend extends BackendBase {
  getRoomBySlug: (roomSlug: string) => Promise<IResponse<IDbRoom>>;
  getEpisode: (episodeId: string) => Promise<IResponse<IDbEpisode>>;
  createEpisode: (
    episode: Partial<IDbEpisode>,
    playlistId: string,
    imageFileUrl: string,
    audioFileUrl: string
  ) => Promise<IResponse<IDbEpisode>>;
  updateEpisode: (
    episodeId: string,
    episode: Partial<IDbEpisode>
  ) => Promise<IResponse<IDbEpisode>>;
  addExternalImage: (
    url: string
  ) => Promise<IResponse<{ file: IDbFileData; id: string }>>;
}
