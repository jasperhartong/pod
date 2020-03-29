import * as Yup from "yup";
import IMeta from "./base/IMeta";

import { ISignedUrl } from "../../file-storage/interfaces/ISignedUrl";

/**
 * Request
 */

export interface RequestData {
  fileName: string;
  fileType: string;
}

export const reqDataSchema: Yup.ObjectSchema<Yup.Shape<
  object,
  RequestData
>> = Yup.object().shape({
  fileName: Yup.string().required(),
  fileType: Yup.string().required()
});

/**
 * Response
 */

export type ResponseData = ISignedUrl;

/**
 * Meta
 */

class Meta implements IMeta {
  domain = "signedurl";
  action = "create";
  reqDataSchema = reqDataSchema;
  // TODO: add resDataSchema
}

export default new Meta();
