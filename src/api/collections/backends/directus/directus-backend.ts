import DirectusSDK from "@directus/sdk-js";
import axios, { AxiosResponse } from "axios";
import { IDbRoom } from "../../interfaces/IDbRoom";
import { IDbEpisode } from "../../interfaces/IDbEpisode";
import { IDBFileUpload, IDbFileData } from "../../interfaces/IDbFileData";
import { ITapesMeBackend } from "../ITapesMeBackend";
import { OK, ERR } from "../../../IResponse";

const token = process.env.DIRECTUS_CLOUD_TOKEN;
const project = "dcMJTq1b80lIY4CT";
if (!token) {
  console.warn(process.env);
  throw Error(`process.env.DIRECTUS_CLOUD_TOKEN not set`);
}

class DirectusTapesMeBackend implements ITapesMeBackend {
  constructor(
    private client = new DirectusSDK({
      url: "https://api.directus.cloud/",
      project,
      token,
      mode: "jwt"
    }),
    private roomCollection = "rooms",
    private playlistCollection = "playlists",
    private episodeCollection = "episodes"
  ) {}

  public getRoomBySlug = async (roomSlug: string) => {
    try {
      const roomResponse = await this.client.getItems<IDbRoom[]>(
        this.roomCollection,
        {
          filter: {
            slug: {
              eq: roomSlug
            }
          },
          fields: [
            "*",
            "playlists.*",
            "playlists.cover_file.data",
            "playlists.episodes.*",
            "playlists.episodes.audio_file.data",
            "playlists.episodes.image_file.data"
          ]
        }
      );

      if (roomResponse.data.length == 1) {
        return OK<IDbRoom>(roomResponse.data[0]);
      }
    } catch (error) {
      console.error(error);
    }

    return ERR<IDbRoom>("Room could not be fetched");
  };

  public getEpisode = async (episodeId: string) => {
    try {
      const itemResponse = await this.client.getItem<IDbEpisode>(
        this.episodeCollection,
        episodeId,
        {
          fields: ["*", "audio_file.data", "image_file.data"]
        }
      );
      return OK<IDbEpisode>(itemResponse.data);
    } catch (error) {
      console.error(error);
    }
    return ERR<IDbEpisode>("Episode could not be fetched");
  };

  public createEpisode = async (
    episode: Partial<IDbEpisode>,
    playlistId: string,
    imageFileId: string,
    audioFileId: string
  ) => {
    try {
      const itemResponse = await this.client.createItem<
        Partial<
          | IDbEpisode
          | { image_file: string; audio_file: string; playlist: string }
        >
      >(this.episodeCollection, {
        ...episode,
        image_file: imageFileId,
        audio_file: audioFileId,
        playlist: playlistId
      });
      return OK<IDbEpisode>((itemResponse.data as unknown) as IDbEpisode);
    } catch (error) {
      console.error(error);
    }
    return ERR<IDbEpisode>("Episode could not be created");
  };

  public updateEpisode = async (
    episodeId: string,
    episode: Partial<IDbEpisode>
  ) => {
    try {
      const itemResponse = await this.client.updateItem<Partial<IDbEpisode>>(
        this.episodeCollection,
        episodeId,
        episode
      );
      // TODO: Add Yup validation per item!
      return OK<IDbEpisode>((itemResponse.data as unknown) as IDbEpisode);
    } catch (error) {
      console.error(error);
    }
    return ERR<IDbEpisode>("Episode could not be updated");
  };

  public addExternalImage = async (url: string) => {
    try {
      // Needs to be done with raw api; Directus SDK doesn't support this call (...)
      const fileUpload = await axios.post<
        { url: string },
        AxiosResponse<{ data: IDBFileUpload }>
      >(
        `${this.client.config.url}${this.client.config.project}/files`,
        { data: url },
        { headers: { authorization: `Bearer ${this.client.config.token}` } }
      );

      return OK<{ file: IDbFileData; id: string }>({
        file: fileUpload.data.data.data,
        id: fileUpload.data.data.id.toString()
      });
    } catch (error) {
      console.error(error);
    }
    return ERR<{ file: IDbFileData; id: string }>(
      "External Image could not be added to backend"
    );
  };
}

const directusTapesMeBackend = new DirectusTapesMeBackend();

export default directusTapesMeBackend;
