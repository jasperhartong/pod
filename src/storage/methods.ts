import { DateTime } from "luxon";
import DirectusSDK from "@directus/sdk-js";
import { DbEpisode, DbDateString, DbPlaylist, DbRoom } from "./interfaces";

const token = process.env.DIRECTUS_CLOUD_TOKEN;

if (!token) {
  console.warn(process.env);
  throw Error(`process.env.DIRECTUS_CLOUD_TOKEN not set`);
}

const project = "dcMJTq1b80lIY4CT";

const client = new DirectusSDK({
  url: "https://api.directus.cloud/",
  project,
  token,
  mode: "jwt"
});

const DIRECTUS_DATE_TIME_FORMAT = "y-MM-dd HH:mm:ss";

export const parseDbDate = (date: DbDateString): DateTime =>
  DateTime.fromFormat(date, DIRECTUS_DATE_TIME_FORMAT);

const roomFields = [
  "*",
  "playlists.*",
  "playlists.cover_file.data",
  "playlists.episodes.*",
  "playlists.episodes.audio_file.data",
  "playlists.episodes.image_file.data"
];
export const getRoomBySlug = async (roomSlug: string) => {
  let room: DbRoom | null = null;
  let warning: string | null = null;

  try {
    const roomResponse = await client.getItems<DbRoom[]>("rooms", {
      filter: {
        slug: {
          eq: roomSlug
        }
      },
      fields: roomFields
    });
    console.warn(JSON.stringify(roomResponse));

    if (roomResponse.data.length == 1) {
      room = roomResponse.data[0];
    } else {
      throw Error("Not found");
    }
    // TODO: Add Yup validation
  } catch (error) {
    console.error(error);
    warning = "Items could not be fetched";
  }
  return { room, warning };
};

export const getEpisode = async (playlistId: string, episodeId: string) => {
  let item: DbEpisode | undefined = undefined;
  let warning: string | null = null;

  try {
    const itemResponse = await client.getItem<DbEpisode>("pods", episodeId, {
      fields: episodeFields
    });
    // TODO: Add Yup validation
    item = itemResponse.data;
  } catch (error) {
    console.error(error);
    warning = "Items could not be get";
  }
  return { item, warning };
};

export const updateEpisode = async (
  playlistId: string,
  episodeId: string,
  episode: Partial<DbEpisode>
) => {
  let item: Partial<DbEpisode> | undefined = undefined;
  let warning: string | null = null;

  try {
    const itemResponse = await client.updateItem<Partial<DbEpisode>>(
      "pods",
      episodeId,
      episode
    );
    // TODO: Add Yup validation per item!
    item = itemResponse.data;
  } catch (error) {
    console.error(error);
    warning = "Item could not be patched";
  }
  return { item, warning };
};

/* DEPRECATED: */
export const getPlaylist = async (slug: string): Promise<DbPlaylist | null> => {
  const { items, warning } = await getEpisodes(slug);
  if (!items) {
    return null;
  }
  const cover_file =
    items.length > 0
      ? items[items.length - 1].image_file
      : { data: { url: "", full_url: "", thumbnails: null } };

  return {
    id: 1,
    created_on: "",
    to: "Loïs & Robin",
    from: `Oma`,
    cover_file,
    episodes: items
  };
};

const episodeFields = ["*", "audio_file.data", "image_file.data"];

export const getEpisodes = async (slug: string) => {
  let items: DbEpisode[] = [];
  let warning: string | null = null;

  try {
    const itemsReponse = await client.getItems<DbEpisode[]>("pods", {
      filter: {
        status: {
          eq: "published"
        }
      },
      fields: episodeFields
    });

    // TODO: Add Yup validation per item!
    items = itemsReponse.data;
  } catch (error) {
    console.error(error);
    warning = "Items could not be fetched";
  }
  return { items, warning };
};
