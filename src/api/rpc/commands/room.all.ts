import { dynamoTableTapes } from "@/api/collection-storage/backends/dynamodb";
import { ERR } from "@/api/IResponse";
import { RPCHandlerFactory } from "@/api/rpc/rpc-server-handler";
import HttpStatus from "http-status-codes";
import meta from "./room.all.meta";


export default RPCHandlerFactory(meta, async (reqData) => {
  if (!process.env.SUPER_ADMIN_SECRET) {
    throw Error(`No secret set up`);
  }
  if (reqData.secret !== process.env.SUPER_ADMIN_SECRET) {
    return ERR("No valid secret passed along", HttpStatus.FORBIDDEN);
  }
  return await dynamoTableTapes.getRooms();
});
