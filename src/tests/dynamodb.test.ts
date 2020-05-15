import { TapesDynamoBackend } from "@/api/collection-storage/backends/dynamodb-backend";
import { IEpisode } from "@/app-schema/IEpisode";
import { IRoom } from "@/app-schema/IRoom";
import { DateTime } from "luxon";
import shortid from "shortid";
import { IPlaylist } from "../app-schema/IPlaylist";

let backend: TapesDynamoBackend;

beforeAll(async () => {
  backend = new TapesDynamoBackend({
    dbConfig: {
      region: "local-env",
    },
    docClientConfig: {
      endpoint: "localhost:8000",
      sslEnabled: false,
      region: "local-env",
    },
  });
  await backend.initiate();
});

describe("Use the DynamyDB backend", () => {
  it("can create room", async () => {
    const room = generateRoomData();
    const roomCreation = await backend.createRoom(room);

    expect(roomCreation.ok).toEqual(true);
    if (roomCreation.ok) {
      expect(roomCreation.data).toEqual(room);
    }
  });

  it("can fetch just created room", async () => {
    const room = generateRoomData();

    await backend.createRoom(room);
    const roomFetching = await backend.getRoom(room.uid);

    expect(roomFetching.ok).toEqual(true);
    if (roomFetching.ok) {
      expect(roomFetching.data).toEqual(room);
    }
  });

  it("can create playlist", async () => {
    const room = generateRoomData();
    const playlist = generatePlaylistData();

    await backend.createRoom(room);
    const playlistCreation = await backend.createPlaylist(room.uid, playlist);

    expect(playlistCreation.ok).toEqual(true);
    if (playlistCreation.ok) {
      expect(playlistCreation.data).toEqual(playlist);
    }
  });

  it("can create episode", async () => {
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
});

const generateRoomData = (): IRoom => {
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
  };
};

const generatePlaylistData = (): IPlaylist => {
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
  };
};

const generateEpisodeData = (): IEpisode => {
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
  };
};
