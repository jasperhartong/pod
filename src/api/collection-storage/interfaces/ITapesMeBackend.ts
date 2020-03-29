import { IDbRoom } from "./IDbRoom";
import { IDbEpisode } from "./IDbEpisode";
import { IDbFileData } from "./IDbFileData";
import { IResponse } from "../../IResponse";

export interface ITapesMeBackend {
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
