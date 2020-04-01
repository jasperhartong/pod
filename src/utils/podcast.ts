import { IPlaylist } from "../app-schema/IPlaylist";
import { toXML } from "jstoxml";
import { podItemPageUrl, podPageUrl, mediaRedirectUrl } from "../urls";
import { parseDbDate } from "../api/collection-storage/backends/directus-utils";

export const podcastXMLFromFeed = (slug: string, feed: IPlaylist): string => {
  const xmlOptions = {
    header: true,
    indent: "  ",
    filter: {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
      "&": "&amp;"
    },
    attributesFilter: {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
      "&": "&amp;"
    }
  };

  const xmlItems = feed.episodes.map(item => ({
    item: [
      {
        title: item.title || ""
      },
      {
        "itunes:author": feed.description || ""
      },
      {
        "itunes:subtitle": ""
      },
      {
        "itunes:summary": ""
      },
      {
        "itunes:image": item.image_file.data.full_url || ""
      },
      {
        _name: "enclosure",
        _attrs: {
          url: encodeURI(
            mediaRedirectUrl(slug, item.id.toString(), item.audio_file || "")
          ),
          // length: "8727310",
          type: "audio/x-mp4"
        }
      },
      {
        guid: podItemPageUrl(slug, item.id.toString())
      },
      {
        pubDate: parseDbDate(item.created_on).toRFC2822()
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
            "itunes:subtitle": feed.title
          },
          {
            "itunes:author": feed.title
          },
          {
            "itunes:summary": feed.description
          },
          {
            description: feed.description
          },
          {
            "itunes:owner": {
              "itunes:name": feed.title
              // "itunes:email": feed.author_email
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
