import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { DateTime } from "luxon";
import { toXML } from "jstoxml";

const url =
  "http://api.directus.cloud/dcMJTq1b80lIY4CT/items/pods?filter[status][eq]=published&fields=*,audio_file.data,image_file.data";
const token = process.env.DIRECTUS_CLOUD_TOKEN;

if (!token) {
  console.warn(process.env);
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
  date: DateTime;
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

const DIRECTUS_DATE_TIME_FORMAT = "y-MM-dd HH:mm:ss";
const getItems = async (url: string) => {
  let items: DbItem[] = [];
  let warning: string | undefined = undefined;
  try {
    const itemsReponse = await axios.get<{ data: DbItem[] }>(url, {
      headers: { authorization: `Bearer ${token}` }
    });
    // TODO: Add Yup validation per item!
    items = itemsReponse.data.data.map(item => {
      item.date = DateTime.fromFormat(
        (item.date as unknown) as string,
        DIRECTUS_DATE_TIME_FORMAT
      );
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
  const { slug } = req.query;
  if (slug !== "elshartong") {
    return res.status(404).json({ ok: false, msg: "Not Found" });
  }
  const { items, warning } = await getItems(url);
  if (warning) {
    return res.status(400).json({ ok: false, msg: warning });
  }
  const title = "Oma Els leest voor..";
  const description = "Uit pinkeltje en meer";
  const author = {
    name: "Els Hartong",
    email: "els@hartong.nl",
    link: ""
  };
  const baseUrl = "https://pod.jasperhartongprivate.now.sh";
  const rssUrl = "https://pod.jasperhartongprivate.now.sh/feeds/elshartong";
  const cover = items ? items[items.length - 1].image_file.data.full_url : "";
  const xmlOptions = {
    header: true,
    indent: "  "
  };

  const xmlItems = items.map(item => ({
    item: [
      {
        title: item.title || ""
      },
      {
        "itunes:author": author.name || ""
      },
      {
        "itunes:subtitle": item.description || ""
      },
      {
        "itunes:summary": item.description || ""
      },
      {
        "itunes:image": item.image_file.data.full_url || ""
      },
      {
        _name: "enclosure",
        _attrs: {
          url: item.audio_file.data.full_url || "",
          // length: "8727310",
          type: "audio/x-mp4"
        }
      },
      {
        guid: `${baseUrl}/pods/${slug}/${item.id.toString()}`
      },
      {
        pubDate: item.date.toRFC2822()
      },
      // {
      //   "itunes:duration": "7:04"
      // },
      {
        "itunes:keywords": "oma"
      }
    ]
  }));

  const feed = toXML(
    {
      _name: "rss",
      _attrs: {
        "xmlns:itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd",
        version: "2.0"
      },
      _content: {
        channel: [
          {
            title
          },
          {
            link: baseUrl
          },
          {
            language: "nl"
          },
          {
            copyright: "Copyright 202"
          },
          {
            "itunes:subtitle": description
          },
          {
            "itunes:author": author.name
          },
          {
            "itunes:summary": description
          },
          {
            description
          },
          {
            "itunes:owner": {
              "itunes:name": author.name,
              "itunes:email": author.email
            }
          },
          {
            _name: "itunes:image",
            _attrs: {
              href: cover
            }
          },
          {
            _name: "itunes:category",
            _attrs: {
              text: "Technology"
            },
            _content: {
              _name: "itunes:category",
              _attrs: {
                text: "Gadgets"
              }
            }
          },
          {
            _name: "itunes:category",
            _attrs: {
              text: "TV &amp; Film"
            }
          },
          ...xmlItems
        ]
      }
    },
    xmlOptions
  );

  // TODO: Add CDN caching
  // res.setHeader("Content-type", "text/xml;charset=UTF-8");
  res.send(feed);
};
