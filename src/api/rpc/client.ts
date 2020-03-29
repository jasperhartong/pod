import axios, { AxiosResponse, AxiosError } from "axios";
import { rpcUrl, RpcDomains, RpcActions } from "./urls";
import { IResponse } from "../interfaces";

class RpcClient {
  constructor(
    private client = axios.create({
      timeout: 4000
    })
  ) {}
  public async call<Req, Res>(
    domain: RpcDomains,
    action: RpcActions,
    data: Req
  ): Promise<IResponse<Res>> {
    try {
      const response = await this.client.post<Req, AxiosResponse<Res>>(
        rpcUrl(domain, action),
        data
      );
      return { ok: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(axiosError);
      return { ok: false, status: 500, error: axiosError.message };
    }
  }
}

const rpcClient = new RpcClient();
export default rpcClient;
