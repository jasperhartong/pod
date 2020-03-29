import { NextApiRequest, NextApiResponse } from "next";
import * as episodeCount from "../../../src/api/rpc/episode.count";
import * as episodeCreate from "../../../src/api/rpc/episode.create";
import { IResponse, ERR } from "../../../src/api/IResponse";
import HttpStatus from "http-status-codes";

export default async (
  req: NextApiRequest,
  res: NextApiResponse<IResponse<any>>
) => {
  const { domainAction } = req.query;
  const [domain, action] = (domainAction as string).split(".");

  let responseData = ERR("No RPC found to handle", HttpStatus.NOT_IMPLEMENTED);

  if (episodeCount.domain === domain && episodeCount.action === action) {
    responseData = await episodeCount.handle(req, res);
  }
  if (episodeCreate.domain === domain && episodeCreate.action === action) {
    responseData = await episodeCreate.handle(req, res);
  }

  return res.json(responseData);
};
