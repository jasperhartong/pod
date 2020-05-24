import * as t from "io-ts";
import { TDateString } from "./IDateString";

export const IBase = t.type({
  uid: t.string,
  created_on: TDateString,
});

export type IBase = t.TypeOf<typeof IBase>;
