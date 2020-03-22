import { NextApiRequest, NextApiResponse } from "next";
import { Feed } from "feed";
import axios from "axios";
import { DateTime } from "luxon";

const url =
  "http://api.directus.cloud/dcMJTq1b80lIY4CT/items/pods?filter[status][eq]=published&fields=*,audio_file.data,image_file.data";
const token = process.env.DIRECTUS_CLOUD_TOKEN;

if (!token) {
  throw Error(`process.env.DIRECTUS_CLOUD_TOKEN not set`);
}

interface Thumbnail {
  url: string;
  relative_url: string;
  dimension: string;
  width: number;
  height: number;
}

interface FileData {
  full_url: string;
  url: string;
  thumbnails: Thumbnail[] | null;
}

interface DbItem {
  id: number;
  status: "published" | "draft" | "deleted";
  date: Date;
  title: string | null;
  description: string | null;
  content: string | null;
  image_file: { data: FileData };
  audio_file: { data: FileData };
}

interface ErrorResponse {
  ok: false;
  msg: string;
}

type SuccessResponse = string;

const getItems = async (url: string) => {
  let items: DbItem[] = [];
  let warning: string | undefined = undefined;
  try {
    const itemsReponse = await axios.get<{ data: DbItem[] }>(url, {
      headers: { authorization: `Bearer ${token}` }
    });

    items = itemsReponse.data.data.map(item => {
      item.date = DateTime.fromFormat(
        (item.date as unknown) as string,
        "y-MM-dd HH:mm:ss"
      ).toJSDate();
      return item;
    });
  } catch (error) {
    console.error(error);
    warning = "Items could not be fetched";
  }
  return { items, warning };
};

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse | SuccessResponse>
) => {
  const { items, warning } = await getItems(url);
  if (warning) {
    return res.status(400).json({ ok: false, msg: warning });
  }
  const feed = new Feed({
    title: "Oma Els leest voor",
    id: "http://example.com/",
    description: "Uit pinkeltje en nog meer.",
    link: "http://example.com/",
    language: "nl", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
    image: "http://example.com/image.png",
    favicon: "http://example.com/favicon.ico",
    copyright: "All rights reserved 2013, John Doe",
    generator: "awesome", // optional, default = 'Feed for Node.js'
    feedLinks: {
      json: "https://example.com/json",
      atom: "https://example.com/atom"
    },
    author: {
      name: "Els Hartong",
      email: "johndoe@example.com",
      link: "https://example.com/johndoe"
    }
  });
  items.forEach(item => {
    feed.addItem({
      title: item.title,
      id: item.id.toString(),
      link: item.audio_file.data.full_url,
      description: item.description,
      content: item.content,
      author: [
        {
          name: "Els Hartong",
          email: "els@hartong.nl"
        }
      ],
      date: item.date,
      image: item.image_file.data.full_url
    });
  });
  // TODO: Add CDN caching
  res.send(feed.rss2());
};
