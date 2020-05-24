import { formatErrors } from "@/utils/io-ts";
import { isLeft } from "fp-ts/lib/Either";
import HttpStatus from "http-status-codes";
import { ERR, IResponse, OK } from "../IResponse";
import { IRPCMeta } from "./rpc-meta";

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

    public call = async (reqData: Tq): Promise<IResponse<Ts>> => {
      /* Type safe call (used when directly calling serverside) */
      return this.handleUnsafe(reqData);
      // TODO: Could probaby use a faster shortcut code path
    };

    public handleUnsafe = async (reqData: any): Promise<IResponse<Ts>> => {
      // Validate request data
      const reqValidation = this.meta.reqValidator.decode(reqData);
      if (isLeft(reqValidation)) {
        // const formattedErrors = formatErrors(reqValidation.left);
        const formattedErrors = `RPCHandler:: Request Validation Error: ${formatErrors(
          reqValidation.left
        )}`;
        this.logError(formattedErrors);
        return ERR(formattedErrors, HttpStatus.BAD_REQUEST);
      }

      // Retrieve result
      const response = await this.handler(reqValidation.right);
      if (!response.ok) {
        this.logError(response.error);
        return ERR(response.error, response.status);
      }

      // Validate response
      const resValidation = this.meta.resValidator.decode(response.data);
      if (isLeft(resValidation)) {
        const formattedErrors = `RPCHandler:: Response Validation Error: ${formatErrors(
          resValidation.left
        )}`;
        this.logError(formattedErrors);

        return ERR(formattedErrors, HttpStatus.METHOD_FAILURE);
      }

      // Send back succesful response
      return OK(response.data);
    };

    private logError = (errorMessage: string) => {
      console.error(`RPCHandler::Error (${this.commandId}): ${errorMessage}`);
    };
  }

  return new RPCHandler(meta, handler);
};
