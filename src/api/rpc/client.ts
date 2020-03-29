import axios, { AxiosResponse, AxiosError } from "axios";
import { IResponse } from "../IResponse";
import { baseUrl } from "../../urls";

export const rpcBasePath = `${baseUrl}/api/rpc/`;

export const rpcUrl = (domain: string, action: string) =>
  `${rpcBasePath}${domain}.${action}`;

class RpcClient {
  constructor(
    private client = axios.create({
      timeout: 4000
    })
  ) {}
  public async call<ReqData, ResData>(
    domain: string,
    action: string,
    data: ReqData
  ): Promise<IResponse<ResData>> {
    try {
      const response = await this.client.post<ReqData, AxiosResponse<ResData>>(
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
