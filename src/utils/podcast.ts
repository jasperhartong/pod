import { IPlaylist } from "../app-schema/IPlaylist";
import { toXML } from "jstoxml";
import { futureEpisodePage, roomPageUrl } from "../urls";
import { parseDbDate } from "../api/collection-storage/backends/directus-utils";
import { IRoom } from "../app-schema/IRoom";
import { IEpisode } from "../app-schema/IEpisode";

export const podcastXML = (room: IRoom): string => {
  const xmlOptions = {
    header: true,
    indent: "  ",
    filter: {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
      "&": "&amp;",
    },
    attributesFilter: {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
      "&": "&amp;",
    },
  };

  const playlistsContainingPublishedEpisodes = room.playlists.filter(
    (p) => p.episodes.filter((e) => e.status === "published").length > 0
  );

  let xmlItems: ReturnType<typeof itemFromEpisode>[] = [];

  playlistsContainingPublishedEpisodes.forEach((playlist) => {
    playlist.episodes.forEach((episode) => {
      if (episode.status === "published") {
        xmlItems.push(itemFromEpisode(episode, playlist, room));
      }
    });
  });

  const podcastXML = toXML(
    {
      _name: "rss",
      _attrs: {
        "xmlns:itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd",
        version: "2.0",
      },
      _content: {
        channel: [
          {
            title: room.title,
          },
          {
            link: roomPageUrl(room.slug),
          },
          {
            language: "nl",
          },
          {
            copyright: "Copyright 2020",
          },
          {
            "itunes:subtitle": room.slug,
          },
          {
            "itunes:author": room.title,
          },
          {
            "itunes:summary": playlistsContainingPublishedEpisodes
              .map((p) => p.title)
              .join("; "),
          },
          {
            description: playlistsContainingPublishedEpisodes
              .map((p) => p.title)
              .join("; "),
          },
          {
            "itunes:owner": {
              "itunes:name": room.title,
              // "itunes:email": feed.author_email
            },
          },
          {
            _name: "itunes:image",
            _attrs: {
              href: room.cover_file.data.full_url,
            },
          },
          {
            _name: "itunes:category",
            _attrs: {
              text: "Family",
            },
            _content: {
              _name: "itunes:category",
              _attrs: {
                text: "Stories",
              },
            },
          },
          ...xmlItems,
        ],
      },
    },
    xmlOptions
  );
  return podcastXML;
};

const itemFromEpisode = (
  episode: IEpisode,
  playlist: IPlaylist,
  room: IRoom
) => ({
  item: [
    {
      title: episode.title || "",
    },
    {
      "itunes:author": playlist.description || "",
    },
    {
      "itunes:subtitle": playlist.title || "",
    },
    {
      "itunes:summary": episode.title || "",
    },
    {
      "itunes:image": episode.image_file.data.full_url || "",
    },
    {
      "itunes:season": playlist.title || "",
    },
    {
      _name: "enclosure",
      _attrs: {
        url: encodeURI(episode.audio_file || ""),
        // length: "8727310",
        type: "audio/x-mp4",
      },
    },
    {
      guid: futureEpisodePage(room.slug, playlist.id, episode.id),
    },
    {
      pubDate: parseDbDate(episode.created_on).toRFC2822(),
    },
    // {
    //   "itunes:duration": "7:04"
    // },
    // {
    //   "itunes:keywords": "oma",
    // },
  ],
});
