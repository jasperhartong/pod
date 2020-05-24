import * as t from "io-ts";
import { withFallback } from "io-ts-types/lib/withFallback";

export const TStringWithFallback = withFallback(t.string, "");

/*
  Don't use optional values in schema definitions, can mean 2 things:
  - either the key is missing
  - the value is actually set to `undefined`

  Also, in the second case, `undefined` is not JSON serializable

  Use null values to be explicit.

  Enforce them so even when the key is somehow missing in the data, it will be `null` after decoding
  */
export const TNullableWithFallback = <T extends t.Type<any, any, any>>(
  type: T
) => withFallback(t.union([type, t.null]), null);

export const formatErrors = (errors: t.Errors) =>
  errors.map((error) => error.context.map(({ key }) => key).join("."));
