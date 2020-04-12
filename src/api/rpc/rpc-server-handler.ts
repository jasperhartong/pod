import { isLeft } from "fp-ts/lib/Either";
import { IRPCMeta } from "./rpc-meta";
import { IResponse, ERR, OK } from "../IResponse";
import HttpStatus from "http-status-codes";

export const RPCHandlerFactory = <Tq, Oq, Iq, Ts, Os, Is>(
  meta: IRPCMeta<Tq, Oq, Iq, Ts, Os, Is>,
  handler: (reqData: Tq) => Promise<IResponse<any>>
) => {
  /**
   * Class Factory to infer correct typings
   */
  class RPCHandler<Tq, Oq, Iq, Ts, Os, Is> {
    public commandId: string;

    constructor(
      private meta: IRPCMeta<Tq, Oq, Iq, Ts, Os, Is> = meta,
      private handler: (reqData: Tq) => Promise<IResponse<any>> = handler
    ) {
      this.commandId = `${this.meta.domain}.${this.meta.action}`;
    }

    public handle = async (reqData: any): Promise<IResponse<Ts>> => {
      // Validate request data
      const reqValidation = this.meta.reqValidator.decode(reqData);
      if (isLeft(reqValidation)) {
        console.error(reqValidation.left);
        // TODO: wrap io-ts Errors errors into ERR
        return ERR("invalid request", HttpStatus.BAD_REQUEST);
      }

      // Retrieve result
      const response = await this.handler(reqValidation.right);
      if (!response.ok) {
        return ERR(response.error);
      }

      // Validate response
      const resValidation = this.meta.resValidator.decode(response.data);
      if (isLeft(resValidation)) {
        console.error(resValidation.left);
        // TODO: wrap io-ts Errors errors into ERR
        return ERR("invalid response payload", HttpStatus.METHOD_FAILURE);
      }

      // Send back succesful response
      return OK(response.data);
    };
  }
  return new RPCHandler(meta, handler);
};
