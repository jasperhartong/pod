import { TapesDynamoBackend } from "@/api/collection-storage/backends/dynamodb-backend";
import { IRoom } from "@/app-schema/IRoom";
import shortid from "shortid";

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

describe("Create room", () => {
  it("can create room", async () => {
    const room = generateRoom();
    const roomCreation = await backend.createRoom(room);

    expect(roomCreation.ok).toEqual(true);
    if (roomCreation.ok) {
      expect(roomCreation.data).toEqual(room);
    }
  });

  it("can fetch just created room", async () => {
    const room = generateRoom();

    await backend.createRoom(room);
    const roomFetching = await backend.getRoomBySlug(room.slug);

    expect(roomFetching.ok).toEqual(true);
    if (roomFetching.ok) {
      expect(roomFetching.data).toEqual(room);
    }
  });
});

const generateRoom = (): IRoom => {
  return {
    id: 0,
    slug: shortid.generate(),
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
