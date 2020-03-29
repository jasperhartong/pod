import * as Yup from "yup";
export type Domains = "episode" | "file";

export default interface IMeta {
  domain: Domains;
  action: string;
  reqDataSchema: Yup.Schema<Yup.Shape<object, object>>;
  // resDataSchema: Yup.Schema<Yup.Shape<object, object>>;
}
