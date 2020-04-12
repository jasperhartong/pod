import axios, { AxiosResponse, AxiosError } from "axios";
import { IRPCMeta } from "./commands/base/rpc-meta";
import { IResponse, ERR } from "../IResponse";
import HttpStatus from "http-status-codes";

export const rpcBasePath = `/api/rpc/`;

export const RPCClientFactory = <Tq, Oq, Iq, Ts, Os, Is>(
  meta: IRPCMeta<Tq, Oq, Iq, Ts, Os, Is>
) => {
  /**
   * Class Factory to infer correct typings
   */
  class RPCClient<Tq, Oq, Iq, Ts, Os, Is> {
    private RPCUrl = (domain: string, action: string) =>
      `${this.rpcBasePath}${domain}.${action}`;

    constructor(
      private meta: IRPCMeta<Tq, Oq, Iq, Ts, Os, Is> = meta,
      private rpcBasePath: string = `/api/rpc/`,
      private client = axios.create({
        timeout: 10000,
      })
    ) {}

    public async call(data: Tq): Promise<IResponse<Ts>> {
      try {
        const response = await this.client.post<
          Tq,
          AxiosResponse<IResponse<Ts>>
        >(this.RPCUrl(this.meta.domain, this.meta.action), data);
        // Internal API, no need to validate again.
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error("RpcClient.call", axiosError.message);
        return ERR(axiosError.message, HttpStatus.NOT_ACCEPTABLE);
      }
    }
  }

  return new RPCClient(meta);
};
