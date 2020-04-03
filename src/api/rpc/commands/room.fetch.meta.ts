import * as Yup from "yup";
import IMeta from "./base/IMeta";

import { IRoom } from "../../../app-schema/IRoom";

/**
 * Request
 */

export interface RequestData {
  slug: string;
}

export const reqDataSchema: Yup.ObjectSchema<Yup.Shape<
  object,
  RequestData
>> = Yup.object().shape({
  slug: Yup.string().required()
});

/**
 * Response
 */

export type ResponseData = IRoom;

/**
 * Meta
 */

class Meta implements IMeta {
  domain = "room";
  action = "fetch";
  reqDataSchema = reqDataSchema;
  // TODO: add resDataSchema
}

export default new Meta();
