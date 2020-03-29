import * as Yup from "yup";
import IMeta from "./base/IMeta";

import { IDbEpisode } from "../../collection-storage/interfaces/IDbEpisode";

/**
 * Request
 */

export interface RequestData {
  title: string;
  description: string;
  status: IDbEpisode["status"];
  playlist: string;
  audio_url: string;
  image_url: string;
}

export const reqDataSchema: Yup.ObjectSchema<Yup.Shape<
  object,
  RequestData
>> = Yup.object().shape({
  title: Yup.string().required(),
  description: Yup.string().required(),
  // TODO: improve
  status: Yup.string().required() as Yup.StringSchema<IDbEpisode["status"]>,
  playlist: Yup.string().required(),
  audio_url: Yup.string().required(),
  image_url: Yup.string().required()
});

/**
 * Response
 */

export type ResponseData = IDbEpisode;

/**
 * Meta
 */

class Meta implements IMeta {
  domain = "episode";
  action = "create";
  reqDataSchema = reqDataSchema;
  // TODO: add resDataSchema
}

export default new Meta();
