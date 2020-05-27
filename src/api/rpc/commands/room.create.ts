import { dynamoTableTapes } from "@/api/collection-storage/backends/dynamodb";
import { generateUid } from "@/api/collection-storage/backends/dynamodb/dynamodb-utils";
import { RPCHandlerFactory } from "@/api/rpc/rpc-server-handler";
import { DateTime } from "luxon";
import meta from "./room.create.meta";

export default RPCHandlerFactory(meta, async (reqData) => {
  const uid = generateUid();

  return dynamoTableTapes.createRoom({
    uid,
    created_on: DateTime.utc().toJSON(),
    title: reqData.data.title,
    cover_file: {
      data: {
        full_url: "",
      },
    },
    playlists: [],
  });
});
