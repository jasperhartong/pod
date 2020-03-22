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
    title: "Oma Els leest voor..",
    description: `Uit pinkeltje en meer.`,
    content: "Uit pinkeltje en meer",
    author_name: "Els Hartong",
    author_email: "els@hartong.nl",
    cover_file,
    items
  };
};

export const getItems = async (slug: string) => {
  const url =
    "http://api.directus.cloud/dcMJTq1b80lIY4CT/items/pods?filter[status][eq]=published&fields=*,audio_file.data,image_file.data";
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
  return { items, warning };
};
