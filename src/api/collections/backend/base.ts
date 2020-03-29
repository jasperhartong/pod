import { IResponse } from "../../interfaces";
type BackendMethod = (...args: any[]) => Promise<IResponse<any>>;

export type BackendBase = {
  // Not sure why this is not ok, but... oh well
  //   [key: string]: BackendMethod;
};
