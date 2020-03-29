import { BaseRpcCommand } from "./base/base-command";
import { fileStorageBackend } from "../../file-storage/index";
import signedurlCreateMeta, {
  RequestData,
  ResponseData
} from "./signedurl.create.meta";

const signedUrlCreate = new BaseRpcCommand<RequestData, ResponseData>(
  signedurlCreateMeta,
  async (req, _) => {
    const reqData = req.body;
    return await fileStorageBackend.getSignedUrl(
      reqData.fileName,
      reqData.fileName
    );
  }
);

export default signedUrlCreate;
