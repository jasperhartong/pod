import { dynamoTableTapes } from "../../collection-storage/backends/dynamodb";
import { RPCHandlerFactory } from "../rpc-server-handler";
import meta from "./episode.update.meta";

export default RPCHandlerFactory(meta, async (reqData) => {
  // currently reqData contains too much, updateing all fields...
  return dynamoTableTapes.updateEpisode(
    reqData.roomUid,
    reqData.playlistUid,
    reqData.episodeUid,
    reqData.data
  );
});
