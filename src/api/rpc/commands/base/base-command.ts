import { NextApiRequest, NextApiResponse } from "next";
import { IResponse, ERR } from "../../../IResponse";
import IMeta from "./IMeta";
import HttpStatus from "http-status-codes";

export class BaseRpcCommand<ReqData, ResData> {
  public commandId: string;

  constructor(
    private meta: IMeta,
    private handler: (reqData: ReqData) => Promise<IResponse<ResData>>
  ) {
    this.commandId = `${this.meta.domain}.${this.meta.action}`;
  }

  public async handle(
    req: Omit<NextApiRequest, "body"> & { body: ReqData },
    res: NextApiResponse
  ): Promise<IResponse<ResData>> {
    // Validate method
    if (req.method !== "POST") {
      return ERR("Only handles POST", HttpStatus.BAD_REQUEST);
    }
    const reqData = req.body as ReqData;
    return await this.handleReqData(reqData);
  }

  public async handleReqData(reqData: ReqData): Promise<IResponse<ResData>> {
    // Validate body
    try {
      this.meta.reqDataSchema.validateSync(reqData);
    } catch (error) {
      console.error(error);
      return ERR("Validation error", HttpStatus.BAD_REQUEST);
    }
    // TODO: validate auth

    // TODO: validate response
    return await this.handler(reqData);
  }
}
