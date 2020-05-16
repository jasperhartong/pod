import { dynamoTableTapes } from "@/api/collection-storage/backends/dynamodb/dynamodb-table-tapes";
import { RPCHandlerFactory } from "@/api/rpc/rpc-server-handler";
import { DateTime } from "luxon";
import shortid from "shortid";
import meta from "./room.create.meta";

export default RPCHandlerFactory(meta, async (reqData) => {
  const uid = shortid.generate();

  if (!dynamoTableTapes.online) {
    await dynamoTableTapes.initiate();
  }

  return dynamoTableTapes.createRoom({
    id: 42,
    uid,
    created_on: DateTime.utc().toJSON(),
    slug: uid,
    title: reqData.data.title,
    cover_file: {
      data: {
        full_url: "",
        thumbnails: [],
      },
    },
    playlists: [],
  });
});
