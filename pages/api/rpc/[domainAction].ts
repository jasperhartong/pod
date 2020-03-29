import { NextApiRequest, NextApiResponse } from "next";
import episodeCount from "../../../src/api/rpc/commands/episode.count";
import episodeCreate from "../../../src/api/rpc/commands/episode.create";
import { IResponse, ERR } from "../../../src/api/IResponse";
import HttpStatus from "http-status-codes";
import signedUrlCreate from "../../../src/api/rpc/commands/signedurl.create";

const handlers = {
  [episodeCreate.commandId]: episodeCreate,
  [episodeCount.commandId]: episodeCount,
  [signedUrlCreate.commandId]: signedUrlCreate
};

export default async (
  req: NextApiRequest,
  res: NextApiResponse<IResponse<any>>
) => {
  const domainAction = req.query.domainAction as string;

  let responseData = ERR("No RPC found to handle", HttpStatus.NOT_IMPLEMENTED);

  if (handlers[domainAction]) {
    responseData = await handlers[domainAction].handle(req, res);
  }

  return res.json(responseData);
};
