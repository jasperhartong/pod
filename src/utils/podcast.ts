import { DbFeedItem } from "../storage/interfaces";
import { toXML } from "jstoxml";
import {
  podItemPageUrl,
  podPageUrl,
  rssMediaRedirectUrl
} from "../storage/urls";
import { parseDbDate } from "../storage/methods";

export const podcastXMLFromFeed = (slug: string, feed: DbFeedItem): string => {
  const xmlOptions = {
    header: true,
    indent: "  ",
    filter: {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
      "&": "&amp;"
    }
  };

  const xmlItems = feed.items.map(item => ({
    item: [
      {
        title: item.title || ""
      },
      {
        "itunes:author": feed.author_name || ""
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
          url: rssMediaRedirectUrl(
            slug,
            item.id.toString(),
            item.audio_file.data.full_url || ""
          ),
          // length: "8727310",
          type: "audio/x-mp4"
        }
      },
      {
        guid: podItemPageUrl(slug, item.id.toString())
      },
      {
        pubDate: parseDbDate(item.date).toRFC2822()
      },
      // {
      //   "itunes:duration": "7:04"
      // },
      {
        "itunes:keywords": "oma"
      }
    ]
  }));

  const podcastXML = toXML(
    {
      _name: "rss",
      _attrs: {
        "xmlns:itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd",
        version: "2.0"
      },
      _content: {
        channel: [
          {
            title: feed.title
          },
          {
            link: podPageUrl(slug)
          },
          {
            language: "nl"
          },
          {
            copyright: "Copyright 2020"
          },
          {
            "itunes:subtitle": feed.description
          },
          {
            "itunes:author": feed.author_name
          },
          {
            "itunes:summary": feed.description
          },
          {
            description: feed.description
          },
          {
            "itunes:owner": {
              "itunes:name": feed.author_name,
              "itunes:email": feed.author_email
            }
          },
          {
            _name: "itunes:image",
            _attrs: {
              href: feed.cover_file.data.full_url
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
  return podcastXML;
};
