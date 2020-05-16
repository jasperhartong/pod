import { optional } from "@/utils/io-ts";
import * as t from "io-ts";
import { TDateString } from "./IDateString";

export const IBase = t.type({
  uid: optional(t.string),
  created_on: TDateString,
});

export type IBase = t.TypeOf<typeof IBase>;
