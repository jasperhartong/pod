import { IResponse } from "@/api/IResponse";
import { IEpisode } from "./IEpisode";
import { IImageData } from "./IFileData";
import { IPlaylist } from "./IPlaylist";
import { IRoom } from "./IRoom";

export interface IBackend {
  getRoomBySlug: (roomSlug: string) => Promise<IResponse<IRoom>>;
  getEpisode: (episodeId: string) => Promise<IResponse<IEpisode>>;
  createPlaylist: (
    playlist: Partial<IPlaylist>,
    roomId: string,
    imageFileId: string
  ) => Promise<IResponse<{ id: IPlaylist["id"] }>>;
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