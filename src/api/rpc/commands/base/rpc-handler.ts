import { Errors } from "io-ts";
import { isRight, left, Either } from "fp-ts/lib/Either";
import { IRPCMeta } from "./rpc-meta";
import { IResponse } from "../../../IResponse";

export const RPCHandlerFactory = <Tq, Oq, Iq, Ts, Os, Is>(
  meta: IRPCMeta<Tq, Oq, Iq, Ts, Os, Is>,
  handler: (reqData: Tq) => Promise<IResponse<any>>
) => {
  class RPCHandler<Tq, Oq, Iq, Ts, Os, Is> {
    public commandId: string;

    constructor(
      private meta: IRPCMeta<Tq, Oq, Iq, Ts, Os, Is> = meta,
      private handler: (reqData: Tq) => Promise<IResponse<any>> = handler
    ) {
      this.commandId = `${this.meta.domain}.${this.meta.action}`;
    }

    public handle = async (reqData: any): Promise<Either<Errors, Ts>> => {
      // Validate request data
      const reqResult = this.meta.reqValidator.decode(reqData);
      if (isRight(reqResult)) {
        // Retrieve result
        const resData = await this.handler(reqResult.right);
        if (resData.ok) {
          // Validate result
          return this.meta.resValidator.decode(resData.data);
        }
      } else {
        console.error("invalid request");
        console.error(reqResult.left);
        return left(reqResult.left);
      }
      return left([
        /* Add custom error here? */
      ]);
    };
  }
  return new RPCHandler(meta, handler);
};
