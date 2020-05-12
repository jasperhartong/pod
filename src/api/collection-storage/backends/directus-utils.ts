import { IDateString } from "@/app-schema/IDateString";
import { DateTime } from "luxon";

const DIRECTUS_DATE_TIME_FORMAT = "y-MM-dd HH:mm:ss";
export const parseDbDate = (date: IDateString): DateTime =>
  DateTime.fromFormat(date, DIRECTUS_DATE_TIME_FORMAT, { zone: "UTC" });

export const toDbDate = (date: DateTime): string =>
  date.toFormat(DIRECTUS_DATE_TIME_FORMAT);
