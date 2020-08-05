import HttpStatus from "http-status-codes";
type HttpStatusCode = number;

export interface IOK<T> {
  ok: true;
  data: T;
  warning: string | null;
}

export interface IERR {
  ok: false;
  error: string;
  status: HttpStatusCode;
}

export type IResponse<T> = IOK<T> | IERR;

export const OK = <T>(
  data: T,
  warning: string | null = null
): IResponse<T> => ({
  ok: true,
  data,
  warning,
});

export const ERR = <T>(
  error: string,
  status: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR
): IResponse<T> => ({ ok: false, error, status });

export const unwrap = <T>(response: IResponse<T>) => {
  /*
    unsafe unwrap method that can be used to read the response data without handling the failure case
    const foo<string> = unwrap(await methodReturningIResponseString())
  */
  if (!response.ok) {
    throw Error("Unwrapping failed");
  }
  return response.data;
};
