import axios, { AxiosError, AxiosResponse } from "axios";
import HttpStatus from "http-status-codes";
import { ERR, IResponse } from "../IResponse";
import { IRPCMeta } from "./rpc-meta";

export const rpcBasePath = `/api/rpc/`;

type RPCResponse<Data> = IResponse<Data>;

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
        timeout: 20000,
        // don't validate status, allows to handle the response data and get actual error response
        validateStatus: () => true,
      })
    ) {}

    public async call(data: Tq): Promise<RPCResponse<Ts>> {
      try {
        const response = await this.client.post<
          Tq,
          AxiosResponse<RPCResponse<Ts>>
        >(this.RPCUrl(this.meta.domain, this.meta.action), data);
        // Internal API, request AND response have been validated server-side
        // no need to validate again, just return it
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
