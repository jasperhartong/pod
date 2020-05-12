import { IResponse } from "@/api/IResponse";
import { ISignedUrl } from "./ISignedUrl";

export interface IFileStorage {
  getSignedUrl(
    fileName: string,
    fileType: string
  ): Promise<IResponse<ISignedUrl>>;
}
