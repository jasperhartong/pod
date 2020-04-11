import axios, { AxiosResponse, AxiosError } from "axios";
import { IRPCMeta } from "./commands/base/rpc-meta";
import { Errors, failure } from "io-ts";
import { Either } from "fp-ts/lib/Either";

export const rpcBasePath = `/api/rpc/`;

export const RPCClientFactory = <Tq, Oq, Iq, Ts, Os, Is>(
  meta: IRPCMeta<Tq, Oq, Iq, Ts, Os, Is>
) => {
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

    public async call(data: Tq): Promise<Either<Errors, Ts>> {
      try {
        const response = await this.client.post<
          Tq,
          AxiosResponse<Either<Errors, Ts>>
        >(this.RPCUrl(this.meta.domain, this.meta.action), data);
        // Internal API, no need to validate again.
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error("RpcClient.call", axiosError.message);
        return failure(undefined, [], axiosError.message);
      }
    }
  }

  return new RPCClient(meta);
};
