import { BaseRpcCommand } from "./base/base-command";
import meta, { RequestData, ResponseData } from "./room.fetch.meta";
import { collectionsBackend } from "../../collection-storage";

const roomFetch = new BaseRpcCommand<RequestData, ResponseData>(
  meta,
  async (req, _) => {
    const reqData = req.body;

    return await collectionsBackend.getRoomBySlug(reqData.slug);
  }
);

export default roomFetch;
