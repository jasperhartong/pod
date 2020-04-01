import * as Yup from "yup";
import IMeta from "./base/IMeta";

import { IEpisode } from "../../../app-schema/IEpisode";

/**
 * Request
 */

export interface RequestData {
  playlistId: string;
  episodeId: string;
}

export const reqDataSchema: Yup.ObjectSchema<Yup.Shape<
  object,
  RequestData
>> = Yup.object().shape({
  playlistId: Yup.string().required(),
  episodeId: Yup.string().required()
});

/**
 * Response
 */

export type ResponseData = IEpisode;

/**
 * Meta
 */

class Meta implements IMeta {
  domain = "episode";
  action = "count";
  reqDataSchema = reqDataSchema;
  // TODO: add resDataSchema
}

export default new Meta();
