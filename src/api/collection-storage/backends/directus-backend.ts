import { ERR, OK } from "@/api/IResponse";
import { TDateString } from "@/app-schema/IDateString";
import { IImageData } from "@/app-schema/IFileData";
import DirectusSDK from "@directus/sdk-js";
import HttpStatus from "http-status-codes";
import * as t from "io-ts";

const token = process.env.DIRECTUS_CLOUD_TOKEN;
const project = "dcMJTq1b80lIY4CT";
if (!token) {
  console.warn(process.env);
  throw Error(`process.env.DIRECTUS_CLOUD_TOKEN not set`);
}

/* 
https://github.com/gcanti/io-ts/pull/266#issuecomment-474935329

    const Person = t.interface({
    name: t.string,
    age: optional(t.number)
    })

    Person.decode({name: 'bob'}) // returns right({name: 'bob'})
    Person.is({name: 'bob'}) // returns false
 */
export const optional = <T extends t.Type<any, any, any>>(type: T) =>
  t.union([type, t.null, t.undefined]);

// Typings for Room Stored in Directus
const TDirectusThumbnail = t.type({
  url: t.string,
  relative_url: t.string,
  dimension: t.string,
  width: t.number,
  height: t.number,
});

const TDirectusImageData = t.type({
  full_url: t.string,
  thumbnails: t.array(TDirectusThumbnail),
});

const TDirectusEpisodeStatus = t.keyof({
  // https://github.com/gcanti/io-ts#union-of-string-literals
  published: null,
  draft: null,
  deleted: null,
});

const TDirectusEpisode = t.type({
  id: t.number,
  status: TDirectusEpisodeStatus,
  created_on: TDateString,
  title: t.string,
  image_file: t.type({ data: TDirectusImageData }),
  audio_file: optional(t.string),
  published_on: optional(TDateString),
});

const TDirectusPlaylist = t.type({
  id: t.number,
  created_on: TDateString,
  title: t.string,
  description: t.string,
  cover_file: t.type({ data: TDirectusImageData }),
  // alias
  episodes: t.array(TDirectusEpisode),
});

const TDirectusRoom = t.type({
  id: t.number,
  slug: t.string,
  title: t.string,
  cover_file: t.type({ data: TDirectusImageData }),
  // alias
  playlists: t.array(TDirectusPlaylist),
});

type IDirectusRoom = t.TypeOf<typeof TDirectusRoom>;

class DirectusTapesMeBackend {
  constructor(
    private client = new DirectusSDK({
      url: "https://api.directus.cloud/",
      project,
      token,
      mode: "jwt",
    }),
    private roomCollection = "rooms",
    private playlistCollection = "playlists",
    private episodeCollection = "episodes"
  ) {}

  public getRoomBySlug = async (roomSlug: string) => {
    try {
      const roomResponse = await this.client.getItems<IDirectusRoom[]>(
        this.roomCollection,
        {
          filter: {
            slug: {
              eq: roomSlug,
            },
          },
          fields: [
            "*",
            "cover_file.data",
            "playlists.*",
            "playlists.cover_file.data",
            "playlists.episodes.*",
            "playlists.episodes.image_file.data",
          ],
        }
      );

      if (roomResponse.data.length == 1) {
        // Reverse playlists & episodes (last created = first.) Directus doesn't allow to do this
        roomResponse.data[0].playlists
          .reverse()
          .map((p) => p.episodes.reverse());
        return OK<IDirectusRoom>(roomResponse.data[0]);
      }
    } catch (error) {
      console.error(error);
      return ERR<IDirectusRoom>("Room fetch errored");
    }

    return ERR<IDirectusRoom>("Room not found", HttpStatus.NOT_FOUND);
  };

  // public createPlaylist = async (
  //   playlist: Partial<IPlaylist>,
  //   roomId: string,
  //   imageFileId: string
  // ) => {
  //   try {
  //     const itemResponse = await this.client.createItem<
  //       Partial<IPlaylist | { cover_file: string; room: string }>
  //     >(this.playlistCollection, {
  //       ...playlist,
  //       cover_file: imageFileId,
  //       room: roomId,
  //     });
  //     return OK<{ id: IPlaylist["id"] }>({
  //       id: (itemResponse.data as IPlaylist).id,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  //   return ERR<{ id: IPlaylist["id"] }>(
  //     "Playlist could not be created",
  //     HttpStatus.BAD_REQUEST
  //   );
  // };

  // public getEpisode = async (episodeId: string) => {
  //   try {
  //     const itemResponse = await this.client.getItem<IEpisode>(
  //       this.episodeCollection,
  //       episodeId,
  //       {
  //         fields: ["*", "audio_file.data", "image_file.data"],
  //       }
  //     );
  //     return OK<IEpisode>(itemResponse.data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  //   return ERR<IEpisode>("Episode not found", HttpStatus.NOT_FOUND);
  // };

  // public createEpisode = async (
  //   episode: Partial<IEpisode>,
  //   playlistId: string,
  //   imageFileId: string
  // ) => {
  //   try {
  //     const itemResponse = await this.client.createItem<
  //       Partial<
  //         | Omit<IEpisode, "image_file"> /* setting image by id */
  //         | { image_file: string; playlist: string }
  //       >
  //     >(this.episodeCollection, {
  //       ...episode,
  //       image_file: imageFileId,
  //       playlist: playlistId,
  //     });
  //     return OK<{ id: IEpisode["id"] }>({
  //       id: (itemResponse.data as IEpisode).id,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  //   return ERR<{ id: IEpisode["id"] }>(
  //     "Episode could not be created",
  //     HttpStatus.BAD_REQUEST
  //   );
  // };

  // public updateEpisode = async (
  //   episodeId: string,
  //   episode: Partial<IEpisode>
  // ) => {
  //   try {
  //     const itemResponse = await this.client.updateItem<Partial<IEpisode>>(
  //       this.episodeCollection,
  //       episodeId,
  //       episode
  //     );
  //     return OK<{ id: IEpisode["id"] }>({
  //       id: (itemResponse.data as IEpisode).id,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  //   return ERR<{ id: IEpisode["id"] }>(
  //     "Episode could not be updated",
  //     HttpStatus.BAD_REQUEST
  //   );
  // };

  // public addExternalImage = async (url: string) => {
  //   console.warn(`addExternalImage:: ${url}`);

  //   try {
  //     // Needs to be done with raw api; Directus SDK doesn't support this call (...)
  //     const fileUpload = await axios.post<
  //       { url: string },
  //       AxiosResponse<{ data: IDBFileUpload }>
  //     >(
  //       `${this.client.config.url}${this.client.config.project}/files`,
  //       {
  //         data: url,
  //       },
  //       {
  //         headers: {
  //           authorization: `Bearer ${this.client.config.token}`,
  //           "content-type": "application/json;charset=utf-8",
  //         },
  //       }
  //     );

  //     return OK<{ file: IImageData; id: string }>({
  //       file: fileUpload.data.data.data,
  //       id: fileUpload.data.data.id.toString(),
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  //   return ERR<{ file: IImageData; id: string }>(
  //     "External Image could not be added to backend",
  //     HttpStatus.INTERNAL_SERVER_ERROR
  //   );
  // };
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
