import * as dynamodb from "@/api/collection-storage/backends/dynamodb";
import { DynamoTableTapes } from "@/api/collection-storage/backends/dynamodb/dynamodb-table-tapes";
import { unwrap } from "@/api/IResponse";
import episodeCreate from "@/api/rpc/commands/episode.create";
import episodeDelete from "@/api/rpc/commands/episode.delete";
import episodeUpdate from "@/api/rpc/commands/episode.update";
import playlistCreate from "@/api/rpc/commands/playlist.create";
import roomCreate from "@/api/rpc/commands/room.create";
import roomFetch from "@/api/rpc/commands/room.fetch";
import roomRss from "@/api/rpc/commands/room.rss";
import testTableConfig from "../../jest-dynamodb-config";

beforeAll(() => {
  const localConfig = {
    tableConfig: testTableConfig.tables[0],
    dbConfig: {
      region: "local-env",
    },
    docClientConfig: {
      endpoint: "localhost:8000",
      sslEnabled: false,
      region: "local-env",
    },
  };
  // @ts-ignore
  dynamodb.dynamoTableTapes = new DynamoTableTapes(localConfig);
});

describe("📦 RPC API Integration test", () => {
  it("😊 Can creat room, playlist, episode and update episode twice and delete stuff again", async () => {
    //  Double check that we're correctly mocking
    expect(dynamodb.dynamoTableTapes.tableName).toBe(`TAPESTEST`);

    /* Create room */
    const roomResponse = await roomCreate.call({
      data: { title: "New Room" },
    });

    expect(roomResponse.ok).toBe(true);
    const roomUid = unwrap(roomResponse).uid;

    /* Create playlist */
    const playlistResponse = await playlistCreate.call({
      roomUid,
      data: {
        title: "New Playlist",
        description: "description",
        image_url: "http://image.com/png.jpg",
      },
    });
    expect(playlistResponse.ok).toBe(true);
    const playlistUid = unwrap(playlistResponse).uid;

    /* Create Episode */
    const episodeCreationResponse = await episodeCreate.call({
      roomUid,
      playlistUid,
      data: {
        title: "New Episode",
        image_url: "http://image.com/png.jpg",
        audio_file: null,
        published_on: null,
      },
    });
    expect(episodeCreationResponse.ok).toBe(true);
    const episodeUid = unwrap(episodeCreationResponse).uid;

    /* Update audio_file */
    const episodeWithAudioResponse = await episodeUpdate.call({
      roomUid,
      playlistUid,
      episodeUid,
      data: {
        audio_file: "http://audio.com/mp4.mp3",
      },
    });
    expect(episodeWithAudioResponse.ok).toBe(true);
    const episodeWithAudio = unwrap(episodeWithAudioResponse);
    expect(episodeWithAudio).toEqual({
      ...unwrap(episodeCreationResponse),
      audio_file: "http://audio.com/mp4.mp3",
    });

    /* Update published */
    const episodeWithPublishedResponse = await episodeUpdate.call({
      roomUid,
      playlistUid,
      episodeUid,
      data: {
        status: "published",
      },
    });
    expect(episodeWithPublishedResponse.ok).toBe(true);
    const episodeWithPublished = unwrap(episodeWithPublishedResponse);
    expect(episodeWithPublished).toEqual({
      ...unwrap(episodeCreationResponse),
      audio_file: "http://audio.com/mp4.mp3",
      status: "published",
    });

    /* Fetch back the whole room again, containing playlist with updated, published episode */
    const roomFetchResponse = await roomFetch.call({ uid: roomUid });
    expect(roomFetchResponse.ok).toBe(true);
    expect(unwrap(roomFetchResponse)).toEqual({
      uid: roomUid,
      cover_file: {
        data: {
          full_url: "",
        },
      },
      created_on: unwrap(roomResponse).created_on,
      playlists: [
        {
          uid: playlistUid,
          cover_file: {
            data: {
              full_url: "http://image.com/png.jpg",
            },
          },
          created_on: unwrap(playlistResponse).created_on,
          description: "description",
          title: "New Playlist",
          episodes: [
            {
              uid: episodeUid,
              created_on: unwrap(episodeCreationResponse).created_on,
              audio_file: "http://audio.com/mp4.mp3",
              published_on: null,
              image_file: {
                data: {
                  full_url: "http://image.com/png.jpg",
                },
              },
              title: "New Episode",
              status: "published",
            },
          ],
        },
      ],
      title: "New Room",
    });

    /* Check RSS */
    const roomRssResponse = await roomRss.call({ uid: roomUid });
    expect(roomRssResponse.ok).toBe(true);
    expect(unwrap(roomRssResponse).includes(`<title>New Episode</title>`)).toBe(
      true
    );

    /* Delete Episode */
    const episodeDeleteResponse = await episodeDelete.call({
      roomUid,
      playlistUid,
      episodeUid,
    });
    expect(episodeDeleteResponse.ok).toBe(true);

    /* Fetch back the whole room again, containing playlist without episode */
    const roomFetchResponse2 = await roomFetch.call({ uid: roomUid });
    expect(roomFetchResponse2.ok).toBe(true);
    expect(unwrap(roomFetchResponse2)).toEqual({
      uid: roomUid,
      cover_file: {
        data: {
          full_url: "",
        },
      },
      created_on: unwrap(roomResponse).created_on,
      playlists: [
        {
          uid: playlistUid,
          cover_file: {
            data: {
              full_url: "http://image.com/png.jpg",
            },
          },
          created_on: unwrap(playlistResponse).created_on,
          description: "description",
          title: "New Playlist",
          episodes: [],
        },
      ],
      title: "New Room",
    });

    /* End of test case */
  });
});
