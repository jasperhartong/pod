import { dynamoTableTapes } from "@/api/collection-storage/backends/dynamodb";
import { ERR } from "@/api/IResponse";
import { RPCHandlerFactory } from "@/api/rpc/rpc-server-handler";
import HttpStatus from "http-status-codes";
import meta from "./room.all.meta";

export default RPCHandlerFactory(meta, async (reqData) => {
  if (reqData.secret !== "IGKjygsxlk") {
    return ERR("No valid secret passed along", HttpStatus.FORBIDDEN);
  }
  return await dynamoTableTapes.getRooms();
});
