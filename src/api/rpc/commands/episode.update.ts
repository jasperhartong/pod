import { dynamoTableTapes } from "../../collection-storage/backends/dynamodb/dynamodb-table-tapes";
import { RPCHandlerFactory } from "../rpc-server-handler";
import meta from "./episode.update.meta";

export default RPCHandlerFactory(meta, async (reqData) => {
  return dynamoTableTapes.updateEpisode(
    reqData.roomUid,
    reqData.playlistUid,
    reqData.episodeUid,
    reqData.data
  );
});
