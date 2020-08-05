import { dynamoTableTapes } from "@/api/collection-storage/backends/dynamodb";
import { generateUid } from "@/api/collection-storage/backends/dynamodb/dynamodb-utils";
import { IPlaylist } from "@/app-schema/IPlaylist";
import { DateTime } from "luxon";
import { RPCHandlerFactory } from "../rpc-server-handler";
import meta from "./playlist.create.meta";

export default RPCHandlerFactory(meta, async (reqData) => {
  const uid = generateUid();
  const playlist: IPlaylist = {
    uid,
    created_on: DateTime.utc().toJSON(),
    title: reqData.data.title,
    description: reqData.data.description,
    cover_file: {
      data: {
        full_url: reqData.data.image_url,
      },
    },
    episodes: [],
  };

  return dynamoTableTapes.createPlaylist(reqData.roomUid, playlist);
});
