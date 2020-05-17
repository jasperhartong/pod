import { RPCHandlerFactory } from "@/api/rpc/rpc-server-handler";
import { dynamoTableTapes } from "../../collection-storage/backends/dynamodb/dynamodb-table-tapes";
import meta from "./room.fetch.meta";

export default RPCHandlerFactory(meta, async (reqData) => {
  return await dynamoTableTapes.getRoomWithNested(reqData.uid);
});
