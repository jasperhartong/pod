import HttpStatus from "http-status-codes";
type HttpStatusCode = number;

export interface IOK<T> {
  ok: true;
  data: T;
  warning?: string;
}

export interface IERR {
  ok: false;
  error: string;
  status: HttpStatusCode;
}

export type IResponse<T> = IOK<T> | IERR;

export const OK = <T>(data: T, warning?: string): IResponse<T> => ({
  ok: true,
  data,
  warning
});

export const ERR = <T>(
  error: string,
  status: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR
): IResponse<T> => ({ ok: false, error, status });
