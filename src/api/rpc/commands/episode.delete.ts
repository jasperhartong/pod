import { dynamoTableTapes } from "../../collection-storage/backends/dynamodb";
import { RPCHandlerFactory } from "../rpc-server-handler";
import meta from "./episode.delete.meta";

export default RPCHandlerFactory(meta, async (reqData) => {
  return dynamoTableTapes.deleteEpisode(
    reqData.roomUid,
    reqData.playlistUid,
    reqData.episodeUid
  );
});
