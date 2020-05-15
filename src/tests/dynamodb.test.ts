import { TapesDynamoBackend } from "@/api/collection-storage/backends/dynamodb-backend";
import { IEpisode } from "@/app-schema/IEpisode";
import { IRoom } from "@/app-schema/IRoom";
import { DateTime } from "luxon";
import shortid from "shortid";
import { IPlaylist } from "../app-schema/IPlaylist";

let backend: TapesDynamoBackend;

const localConfig = {
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
  backend = new TapesDynamoBackend(localConfig);
  await backend.initiate();
});

describe("📦 The DynamyDB backend", () => {
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
    const playlist1 = generatePlaylistData({ title: "first" });
    const playlist2 = generatePlaylistData({ title: "second" });
    const episode1a = generateEpisodeData({ title: "a" });
    const episode1b = generateEpisodeData({ title: "b" });
    const episode2a = generateEpisodeData({ title: "a" });
    const episode2b = generateEpisodeData({ title: "b" });
    const episode2c = generateEpisodeData({ title: "c" });

    await backend.createRoom(room);
    await backend.createPlaylist(room.uid, playlist1);
    await backend.createPlaylist(room.uid, playlist2);
    await backend.createEpisode(room.uid, playlist1.uid, episode1a);
    await backend.createEpisode(room.uid, playlist1.uid, episode1b);
    await backend.createEpisode(room.uid, playlist2.uid, episode2a);
    await backend.createEpisode(room.uid, playlist2.uid, episode2b);
    await backend.createEpisode(room.uid, playlist2.uid, episode2c);

    const complexRoomResponse = await backend.getRoomWithNested(room.uid);

    if (complexRoomResponse.ok) {
      expect(complexRoomResponse.data.playlists.length).toEqual(2);
      //   FIXME: Sorting
      //   expect(complexRoomResponse.data.playlists[0].episodes.length).toEqual(3);
      //   expect(complexRoomResponse.data.playlists[1].episodes.length).toEqual(2);
      //   expect(complexRoomResponse.data.playlists.map((p) => p.title)).toEqual([
      //     "second",
      //     "first",
      //   ]);
      //   expect(
      //     complexRoomResponse.data.playlists[0].episodes.map((p) => p.title)
      //   ).toEqual(["b", "a"]);
      //   expect(
      //     complexRoomResponse.data.playlists[1].episodes.map((p) => p.title)
      //   ).toEqual(["c", "b", "a"]);
    }
  });

  //   it("😊 can update and episode", async () => {})

  it("🚧 cannot create room with same uid twice", async () => {
    const room = generateRoomData();
    await backend.createRoom(room);
    const failedRoomCreation = await backend.createRoom(room);

    expect(failedRoomCreation.ok).toEqual(false);
  });

  //   it("🚧 can cannot create playlist in non-existing room", async () => {})
  //   it("🚧 can cannot create episode in non-existing room", async () => {})
  //   it("🚧 can cannot create episode in non-existing playlist", async () => {})
});

const generateRoomData = (partial?: Partial<IRoom>): IRoom => {
  const uid = shortid.generate();
  return {
    id: 0,
    uid,
    slug: uid,
    title: "test",
    cover_file: {
      data: {
        full_url: "",
        thumbnails: [],
      },
    },
    playlists: [],
    ...(partial || {}),
  };
};

const generatePlaylistData = (partial?: Partial<IPlaylist>): IPlaylist => {
  const uid = shortid.generate();
  return {
    id: 0,
    uid,
    created_on: DateTime.utc().toJSON(),
    title: "test",
    description: "test",
    cover_file: {
      data: {
        full_url: "",
        thumbnails: [],
      },
    },
    episodes: [],
    ...(partial || {}),
  };
};

const generateEpisodeData = (partial?: Partial<IEpisode>): IEpisode => {
  const uid = shortid.generate();
  return {
    id: 0,
    uid,
    status: "draft",
    created_on: DateTime.utc().toJSON(),
    published_on: DateTime.utc().toJSON(),
    audio_file: "",
    title: "test",
    image_file: {
      data: {
        full_url: "",
        thumbnails: [],
      },
    },
    ...(partial || {}),
  };
};
