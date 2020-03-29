import * as Yup from "yup";
import IMeta, { Domains } from "./base/IMeta";

import { IDbEpisode } from "../../collection-storage/interfaces/IDbEpisode";

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

export type ResponseData = IDbEpisode;

/**
 * Meta
 */

class Meta implements IMeta {
  domain: Domains = "episode";
  action = "count";
  reqDataSchema = reqDataSchema;
  // TODO: add resDataSchema
}

export default new Meta();
