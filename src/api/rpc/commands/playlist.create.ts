import { IPlaylist } from "@/app-schema/IPlaylist";
import { DateTime } from "luxon";
import shortid from "shortid";
import { dynamoTableTapes } from "../../collection-storage/backends/dynamodb/dynamodb-table-tapes";
import { RPCHandlerFactory } from "../rpc-server-handler";
import meta from "./playlist.create.meta";

export default RPCHandlerFactory(meta, async (reqData) => {
  const uid = shortid.generate();
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
