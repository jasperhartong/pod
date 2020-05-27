import { fileStorageBackend } from "@/api/file-storage/index";
import { RPCHandlerFactory } from "@/api/rpc/rpc-server-handler";
import path from "path";
import uuid4 from "uuid4";
import meta from "./signedurl.create.meta";

export default RPCHandlerFactory(meta, async (reqData) => {
  const originalExtension = path.extname(reqData.fileName); // returns empty string if fails
  const obscuredUniqueFileName = `${uuid4()}${originalExtension}`;

  // Not using original reqData.fileName for now, perhaps add it as tag on file later
  return await fileStorageBackend.getSignedUrl(
    obscuredUniqueFileName,
    reqData.fileType
  );
});
