import { ISignedUrl } from "./ISignedUrl";
import { IResponse } from "../../IResponse";

export interface IFileStorage {
  getSignedUrl(
    fileName: string,
    fileType: string
  ): Promise<IResponse<ISignedUrl>>;
}
