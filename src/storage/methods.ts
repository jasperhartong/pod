import axios from "axios";
import { DateTime } from "luxon";
import { DbPodItem, DbDateString, DbFeedItem } from "./interfaces";
import { podPageUrl } from "./urls";

const token = process.env.DIRECTUS_CLOUD_TOKEN;

if (!token) {
  console.warn(process.env);
  throw Error(`process.env.DIRECTUS_CLOUD_TOKEN not set`);
}

const DIRECTUS_DATE_TIME_FORMAT = "y-MM-dd HH:mm:ss";

export const parseDbDate = (date: DbDateString): DateTime =>
  DateTime.fromFormat(date, DIRECTUS_DATE_TIME_FORMAT);

export const getFeedItem = async (slug: string): Promise<DbFeedItem | null> => {
  const { items, warning } = await getItems(slug);
  if (!items) {
    return null;
  }
  const cover_file =
    items.length > 0
      ? items[items.length - 1].image_file
      : { data: { url: "", full_url: "", thumbnails: null } };

  return {
    id: 1,
    date: "",
    title: "Aan Loïs & Robin",
    description: `Van Oma`,
    content: "Uit pinkeltje en meer",
    author_name: "Oma Els",
    author_email: "els@hartong.nl",
    cover_file,
    items
  };
};

const episodeFields = "*,audio_file.data,image_file.data";
export const getItems = async (slug: string) => {
  const url = `http://api.directus.cloud/dcMJTq1b80lIY4CT/items/pods?filter[status][eq]=published&fields=${episodeFields}`;
  let items: DbPodItem[] = [];
  let warning: string | null = null;
  try {
    const itemsReponse = await axios.get<{ data: DbPodItem[] }>(url, {
      headers: { authorization: `Bearer ${token}` }
    });
    // TODO: Add Yup validation per item!
    items = itemsReponse.data.data;
  } catch (error) {
    console.error(error);
    warning = "Items could not be fetched";
  }
  console.warn(items);
  return { items, warning };
};

export const getEpisode = async (playlistId: string, episodeId: string) => {
  const url = `http://api.directus.cloud/dcMJTq1b80lIY4CT/items/pods/${episodeId}?fields=${episodeFields}`;
  let item: DbPodItem = undefined;
  let warning: string | null = null;
  try {
    const itemsReponse = await axios.get<{ data: DbPodItem }>(url, {
      headers: { authorization: `Bearer ${token}` }
    });
    // TODO: Add Yup validation per item!
    item = itemsReponse.data.data;
  } catch (error) {
    console.error(error);
    warning = "Items could not be patched";
  }
  return { item, warning };
};

export const updateEpisode = async (
  playlistId: string,
  episodeId: string,
  episode: Partial<DbPodItem>
) => {
  const url = `http://api.directus.cloud/dcMJTq1b80lIY4CT/items/pods/${episodeId}`;
  let item: DbPodItem = undefined;
  let warning: string | null = null;
  try {
    console.warn(episode);
    const itemReponse = await axios.patch<{ data: DbPodItem }>(url, episode, {
      headers: { authorization: `Bearer ${token}` }
    });
    // TODO: Add Yup validation per item!
    item = itemReponse.data.data;
    console.warn(itemReponse);
  } catch (error) {
    console.error(error);
    warning = "Item could not be patched";
  }
  return { item, warning };
};
