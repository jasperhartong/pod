import DirectusSDK from "@directus/sdk-js";
import axios, { AxiosResponse } from "axios";
import { IRoom } from "../../../app-schema/IRoom";
import { IEpisode } from "../../../app-schema/IEpisode";
import { IImageData } from "../../../app-schema/IFileData";
import { IBackend } from "../../../app-schema/IBackend";
import { OK, ERR } from "../../IResponse";

const token = process.env.DIRECTUS_CLOUD_TOKEN;
const project = "dcMJTq1b80lIY4CT";
if (!token) {
  console.warn(process.env);
  throw Error(`process.env.DIRECTUS_CLOUD_TOKEN not set`);
}

class DirectusTapesMeBackend implements IBackend {
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
      const roomResponse = await this.client.getItems<IRoom[]>(
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
            "playlists.episodes.image_file.data"
          ]
        }
      );

      if (roomResponse.data.length == 1) {
        return OK<IRoom>(roomResponse.data[0]);
      }
    } catch (error) {
      console.error(error);
    }

    return ERR<IRoom>("Room could not be fetched");
  };

  public getEpisode = async (episodeId: string) => {
    try {
      const itemResponse = await this.client.getItem<IEpisode>(
        this.episodeCollection,
        episodeId,
        {
          fields: ["*", "audio_file.data", "image_file.data"]
        }
      );
      return OK<IEpisode>(itemResponse.data);
    } catch (error) {
      console.error(error);
    }
    return ERR<IEpisode>("Episode could not be fetched");
  };

  public createEpisode = async (
    episode: Partial<IEpisode>,
    playlistId: string,
    imageFileId: string
  ) => {
    try {
      const itemResponse = await this.client.createItem<
        Partial<
          | IEpisode
          | { image_file: string; audio_file: string; playlist: string }
        >
      >(this.episodeCollection, {
        ...episode,
        image_file: imageFileId,
        playlist: playlistId
      });
      return OK<IEpisode>((itemResponse.data as unknown) as IEpisode);
    } catch (error) {
      console.error(error);
    }
    return ERR<IEpisode>("Episode could not be created");
  };

  public updateEpisode = async (
    episodeId: string,
    episode: Partial<IEpisode>
  ) => {
    try {
      const itemResponse = await this.client.updateItem<Partial<IEpisode>>(
        this.episodeCollection,
        episodeId,
        episode
      );
      // TODO: Add Yup validation per item!
      return OK<IEpisode>((itemResponse.data as unknown) as IEpisode);
    } catch (error) {
      console.error(error);
    }
    return ERR<IEpisode>("Episode could not be updated");
  };

  public addExternalImage = async (url: string) => {
    console.warn(`addExternalImage:: ${url}`);

    try {
      // Needs to be done with raw api; Directus SDK doesn't support this call (...)
      const fileUpload = await axios.post<
        { url: string },
        AxiosResponse<{ data: IDBFileUpload }>
      >(
        `${this.client.config.url}${this.client.config.project}/files`,
        {
          data: url
        },
        {
          headers: {
            authorization: `Bearer ${this.client.config.token}`,
            "content-type": "application/json;charset=utf-8"
          }
        }
      );

      return OK<{ file: IImageData; id: string }>({
        file: fileUpload.data.data.data,
        id: fileUpload.data.data.id.toString()
      });
    } catch (error) {
      console.error(error);
    }
    return ERR<{ file: IImageData; id: string }>(
      "External Image could not be added to backend"
    );
  };
}

const directusTapesMeBackend = new DirectusTapesMeBackend();

export default directusTapesMeBackend;

// Private
export interface IDBFileUpload {
  id: number;
  storage: string;
  private_hash: string;
  filename_disk: string;
  filename_download: string;
  title: string;
  type: string;
  uploaded_by: number;
  uploaded_on: string;
  charset: string;
  filesize: number;
  width: number;
  height: number;
  duration: number;
  embed: null;
  folder: null;
  description: string;
  location: string;
  tags: string[];
  checksum: string;
  metadata: Record<string, string> | null;
  data: IImageData;
}
