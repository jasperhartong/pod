import { RPCHandlerFactory } from "../rpc-server-handler";
import meta from "./signedurl.create.meta";
import uuid4 from "uuid4";
import { fileStorageBackend } from "@/api/file-storage/index";

const getFileExtension = (fileName: string): string | undefined => {
  let extension = undefined;
  if (fileName.includes(".")) {
    extension = fileName.substr(fileName.lastIndexOf(".") + 1);
  }
  return extension;
};

export default RPCHandlerFactory(meta, async (reqData) => {
  const originalExtension = getFileExtension(reqData.fileName);
  const obscuredUniqueFileName = originalExtension
    ? `${uuid4()}.${originalExtension}`
    : uuid4();
  // Not using original reqData.fileName for now, perhaps add it as tag on file later
  return await fileStorageBackend.getSignedUrl(
    obscuredUniqueFileName,
    reqData.fileType
  );
});
