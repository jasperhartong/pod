import { DateTime } from "luxon";
import { IDbDateString } from "../interfaces/IDbDateString";

const DIRECTUS_DATE_TIME_FORMAT = "y-MM-dd HH:mm:ss";
export const parseDbDate = (date: IDbDateString): DateTime =>
  DateTime.fromFormat(date, DIRECTUS_DATE_TIME_FORMAT);
