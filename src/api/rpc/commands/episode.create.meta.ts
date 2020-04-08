import * as Yup from "yup";
import IMeta from "./base/IMeta";

import { IEpisode } from "../../../app-schema/IEpisode";

/**
 * Request
 */

export interface RequestData {
  title: string;
  status: IEpisode["status"];
  playlist: string;
  audio_url: string;
  image_url: string;
}

export const reqDataSchema: Yup.ObjectSchema<Yup.Shape<
  object,
  RequestData
>> = Yup.object().shape({
  title: Yup.string().required(),
  // TODO: improve
  status: Yup.string().required() as Yup.StringSchema<IEpisode["status"]>,
  playlist: Yup.string().required(),
  audio_url: Yup.string().required(),
  image_url: Yup.string().required()
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
  action = "create";
  reqDataSchema = reqDataSchema;
  // TODO: add resDataSchema
}

export default new Meta();
