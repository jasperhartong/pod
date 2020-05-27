import { dynamoTableTapes } from "@/api/collection-storage/backends/dynamodb";
import { ERR, OK } from "@/api/IResponse";
import { RPCHandlerFactory } from "@/api/rpc/rpc-server-handler";
import { podcastXML } from "@/utils/podcast";
import meta from "./room.rss.meta";

export default RPCHandlerFactory(meta, async (reqData) => {
  const roomFetched = await dynamoTableTapes.getRoomWithNested(reqData.uid);
  if (!roomFetched.ok) {
    return ERR(roomFetched.error, roomFetched.status);
  }
  const xml = podcastXML(roomFetched.data);
  return OK(xml);
});
