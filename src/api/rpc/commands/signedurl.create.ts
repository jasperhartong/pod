import uuid4 from "uuid4";
import { BaseRpcCommand } from "./base/base-command";
import { fileStorageBackend } from "../../file-storage/index";
import signedurlCreateMeta, {
  RequestData,
  ResponseData
} from "./signedurl.create.meta";

const getFileExtension = (fileName: string): string | undefined => {
  let extension = undefined;
  if (fileName.includes(".")) {
    extension = fileName.substr(fileName.lastIndexOf(".") + 1);
  }
  return extension;
};

const signedUrlCreate = new BaseRpcCommand<RequestData, ResponseData>(
  signedurlCreateMeta,
  async (req, _) => {
    const reqData = req.body;
    const originalExtension = getFileExtension(reqData.fileName);
    const obscuredUniqueFileName = originalExtension
      ? `${uuid4()}.${originalExtension}`
      : uuid4();
    // Not using original reqData.fileName for now, perhaps add it as tag on file later
    return await fileStorageBackend.getSignedUrl(
      obscuredUniqueFileName,
      reqData.fileType
    );
  }
);

export default signedUrlCreate;
