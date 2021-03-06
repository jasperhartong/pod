import { DynamoTableTapes } from "@/api/collection-storage/backends/dynamodb/dynamodb-table-tapes";
import { generateUid } from "@/api/collection-storage/backends/dynamodb/dynamodb-utils";
import { unwrap } from "@/api/IResponse";
import { IEpisode } from "@/app-schema/IEpisode";
import { IPlaylist } from "@/app-schema/IPlaylist";
import { IRoom } from "@/app-schema/IRoom";
import { DateTime } from "luxon";
import testTableConfig from "../../jest-dynamodb-config";

let backend: DynamoTableTapes;

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
const remoteConfig = {
  dbConfig: {},
  docClientConfig: {},
};

beforeAll(async () => {
  backend = new DynamoTableTapes(localConfig);
  await backend.initiate();
});

describe("📦 The TapesDynamoTable", () => {
  it("😊 can create room", async () => {
    const room = generateRoomData();
    const roomCreation = await backend.createRoom(room);

    expect(roomCreation.ok).toEqual(true);
    if (roomCreation.ok) {
      expect(roomCreation.data).toEqual(room);
    }
  });

  it("😊 can fetch just created room", async () => {
    const room = generateRoomData();

    await backend.createRoom(room);
    const roomFetching = await backend.getRoom(room.uid);

    expect(roomFetching.ok).toEqual(true);
    if (roomFetching.ok) {
      expect(roomFetching.data).toEqual(room);
    }
  });

  it("😊 can create playlist", async () => {
    const room = generateRoomData();
    const playlist = generatePlaylistData();

    await backend.createRoom(room);
    const playlistCreation = await backend.createPlaylist(room.uid, playlist);

    expect(playlistCreation.ok).toEqual(true);
    if (playlistCreation.ok) {
      expect(playlistCreation.data).toEqual(playlist);
    }
  });

  it("😊 can create episode", async () => {
    const room = generateRoomData();
    const playlist = generatePlaylistData();
    const episode = generateEpisodeData();

    await backend.createRoom(room);
    await backend.createPlaylist(room.uid, playlist);
    const episodeCreation = await backend.createEpisode(
      room.uid,
      playlist.uid,
      episode
    );

    expect(episodeCreation.ok).toEqual(true);
    if (episodeCreation.ok) {
      expect(episodeCreation.data).toEqual(episode);
    }
  });

  it("😊 can create and retrieve complex nested room", async () => {
    const room = generateRoomData();
    await backend.createRoom(room);

    const playlist1 = generatePlaylistData({ title: "first" });
    await backend.createPlaylist(room.uid, playlist1);

    const playlist2 = generatePlaylistData({ title: "second" });
    await backend.createPlaylist(room.uid, playlist2);

    const episode1a = generateEpisodeData({ title: "a" });
    await backend.createEpisode(room.uid, playlist1.uid, episode1a);

    const episode1b = generateEpisodeData({ title: "b" });
    await backend.createEpisode(room.uid, playlist1.uid, episode1b);

    const episode2a = generateEpisodeData({ title: "a" });
    await backend.createEpisode(room.uid, playlist2.uid, episode2a);

    const episode2b = generateEpisodeData({ title: "b" });
    await backend.createEpisode(room.uid, playlist2.uid, episode2b);

    const episode2c = generateEpisodeData({ title: "c" });
    await backend.createEpisode(room.uid, playlist2.uid, episode2c);

    const complexRoomResponse = await backend.getRoomWithNested(room.uid);

    expect(complexRoomResponse.ok).toBe(true);

    if (complexRoomResponse.ok) {
      // Expect all sorting to be from latest to oldest
      expect(complexRoomResponse.data.playlists.map((p) => p.title)).toEqual([
        "second",
        "first",
      ]);
      expect(
        complexRoomResponse.data.playlists[0].episodes.map((p) => p.title)
      ).toEqual(["c", "b", "a"]);
      expect(
        complexRoomResponse.data.playlists[1].episodes.map((p) => p.title)
      ).toEqual(["b", "a"]);
      // expect episodes to be same shape
      expect(complexRoomResponse.data.playlists[0].episodes).toEqual([
        episode2c,
        episode2b,
        episode2a,
      ]);
      expect(complexRoomResponse.data.playlists[1].episodes).toEqual([
        episode1b,
        episode1a,
      ]);
      // expect playlist to be same shape (except for added episodes)
      expect(
        complexRoomResponse.data.playlists.map((p) => {
          p.episodes = [];
          return p;
        })
      ).toEqual([playlist2, playlist1]);
    }
  });

  it("😊 can update an existing episode", async () => {
    const room = generateRoomData();
    await backend.createRoom(room);

    const playlist1 = generatePlaylistData();
    await backend.createPlaylist(room.uid, playlist1);

    const episode1a = generateEpisodeData();
    await backend.createEpisode(room.uid, playlist1.uid, episode1a);

    const episodeUpdate = await backend.updateEpisode(
      room.uid,
      playlist1.uid,
      episode1a.uid,
      {
        title: "updated",
      }
    );

    expect(episodeUpdate.ok).toBe(true);
    expect(unwrap(episodeUpdate)).toEqual({ ...episode1a, title: "updated" });
  });

  it("😊 can update nested fields in an existing episode", async () => {
    const room = generateRoomData();
    await backend.createRoom(room);

    const playlist1 = generatePlaylistData();
    await backend.createPlaylist(room.uid, playlist1);

    const episode1a = generateEpisodeData();
    await backend.createEpisode(room.uid, playlist1.uid, episode1a);

    const episodeUpdate = await backend.updateEpisode(
      room.uid,
      playlist1.uid,
      episode1a.uid,
      {
        image_file: {
          data: {
            full_url: "updated",
          },
        },
      }
    );

    expect(episodeUpdate.ok).toBe(true);
    expect(unwrap(episodeUpdate)).toEqual({
      ...episode1a,
      image_file: {
        data: {
          full_url: "updated",
        },
      },
    });
  });

  it("😊 can fetch all rooms", async () => {
    const room1 = generateRoomData({ title: "room 1" });
    const room1Response = await backend.createRoom(room1);
    const room2 = generateRoomData({ title: "room 2" });
    const room2Response = await backend.createRoom(room2);

    const allRoomsResponse = await backend.getRooms();
    expect(allRoomsResponse.ok).toEqual(true);

    expect(
      unwrap(allRoomsResponse)
        // Filter out so we can compare what we just shot in
        .filter((room) => [room1.uid, room2.uid].includes(room.uid))
    ).toEqual([unwrap(room2Response), unwrap(room1Response)]);
  });

  it("🚧 cannot create room with same uid twice", async () => {
    const room = generateRoomData();
    await backend.createRoom(room);
    const failedRoomCreation = await backend.createRoom(room);

    expect(failedRoomCreation.ok).toEqual(false);
  });

  it("🚧 cannot create playlist with same uid twice", async () => {
    const room = generateRoomData();
    await backend.createRoom(room);
    const playlist1 = generatePlaylistData();
    await backend.createPlaylist(room.uid, playlist1);

    const playlistCreation = await backend.createPlaylist(room.uid, playlist1);

    expect(playlistCreation.ok).toEqual(false);
  });

  it("🚧 cannot create episode with same uid twice", async () => {
    const room = generateRoomData();
    await backend.createRoom(room);
    const playlist1 = generatePlaylistData();
    await backend.createPlaylist(room.uid, playlist1);
    const episode1a = generateEpisodeData();
    await backend.createEpisode(room.uid, playlist1.uid, episode1a);

    const episodeCreation = await backend.createEpisode(
      room.uid,
      playlist1.uid,
      episode1a
    );

    expect(episodeCreation.ok).toEqual(false);
  });

  it("🚧 cannot update an episode that was not created before", async () => {
    const room = generateRoomData();
    await backend.createRoom(room);

    const playlist1 = generatePlaylistData();
    await backend.createPlaylist(room.uid, playlist1);

    const episode1a = generateEpisodeData();

    // Skip creation
    // await backend.createEpisode(room.uid, playlist1.uid, episode1a);
    // Skip creation

    const episodeUpdate = await backend.updateEpisode(
      room.uid,
      playlist1.uid,
      episode1a.uid,
      {
        title: "updated",
      }
    );

    expect(episodeUpdate.ok).toBe(false);
  });

  it("🚧 cannot create playlist in non-existing room", async () => {
    const room = generateRoomData();
    const playlist = generatePlaylistData();

    // Skip creation
    // await backend.createRoom(room);
    // Skip creation

    const playlistCreation = await backend.createPlaylist(room.uid, playlist);

    expect(playlistCreation.ok).toEqual(false);
  });

  it("🚧 cannot create episode in non-existing room", async () => {
    const room = generateRoomData();
    const playlist = generatePlaylistData();
    const episode = generateEpisodeData();

    // Skip creation
    // await backend.createRoom(room);
    // await backend.createPlaylist(room.uid, playlist);
    // Skip creation

    const episodeCreation = await backend.createEpisode(
      room.uid,
      playlist.uid,
      episode
    );

    expect(episodeCreation.ok).toEqual(false);
  });
  it("🚧 cannot create episode in non-existing playlist", async () => {
    const room = generateRoomData();
    const playlist = generatePlaylistData();
    const episode = generateEpisodeData();

    await backend.createRoom(room);
    // Skip creation
    // await backend.createPlaylist(room.uid, playlist);
    // Skip creation

    const episodeCreation = await backend.createEpisode(
      room.uid,
      playlist.uid,
      episode
    );

    expect(episodeCreation.ok).toEqual(false);
  });
});

const generateRoomData = (partial?: Partial<IRoom>): IRoom => {
  const uid = generateUid();
  return {
    uid,
    created_on: DateTime.utc().toJSON(),
    title: "test",
    cover_file: {
      data: {
        full_url: "",
      },
    },
    playlists: [],
    ...(partial || {}),
  };
};

const generatePlaylistData = (partial?: Partial<IPlaylist>): IPlaylist => {
  const uid = generateUid();
  return {
    uid,
    created_on: DateTime.utc().toJSON(),
    title: "test",
    description: "test",
    cover_file: {
      data: {
        full_url: "",
      },
    },
    episodes: [],
    ...(partial || {}),
  };
};

const generateEpisodeData = (partial?: Partial<IEpisode>): IEpisode => {
  const uid = generateUid();
  return {
    uid,
    status: "draft",
    created_on: DateTime.utc().toJSON(),
    published_on: DateTime.utc().toJSON(),
    audio_file: null,
    title: "test",
    image_file: {
      data: {
        full_url: "a",
      },
    },
    ...(partial || {}),
  };
};
