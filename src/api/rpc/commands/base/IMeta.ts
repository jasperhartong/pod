import * as Yup from "yup";

export default interface IMeta {
  domain: string;
  action: string;
  reqDataSchema: Yup.Schema<Yup.Shape<object, object>>;
  // resDataSchema: Yup.Schema<Yup.Shape<object, object>>;
}
