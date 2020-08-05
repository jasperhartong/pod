import { IDateString } from "@/app-schema/IDateString";
import { DateTime } from "luxon";

const DIRECTUS_DATE_TIME_FORMAT = "y-MM-dd HH:mm:ss";
export const parseDbDate = (date: IDateString): DateTime => {
  let parsed = DateTime.fromFormat(date, DIRECTUS_DATE_TIME_FORMAT, {
    zone: "UTC",
  });
  // Not sure when this happened, but Directus suddenly started sending different date formats...
  if (!parsed.isValid) {
    parsed = DateTime.fromISO(date, { zone: "UTC" });
  }
  return parsed;
};

export const toDbDate = (date: DateTime): string =>
  date.toFormat(DIRECTUS_DATE_TIME_FORMAT);
