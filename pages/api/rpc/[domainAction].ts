import { NextApiRequest, NextApiResponse } from "next";
import { IResponse, ERR } from "../../../src/api/IResponse";
import HttpStatus from "http-status-codes";
import signedUrlCreate from "../../../src/api/rpc/commands/signedurl.create";
import episodeCount from "../../../src/api/rpc/commands/episode.count";
import episodeCreate from "../../../src/api/rpc/commands/episode.create";
import roomFetch from "../../../src/api/rpc/commands/room.fetch";

const handlers = {
  [episodeCreate.commandId]: episodeCreate,
  [episodeCount.commandId]: episodeCount,
  [signedUrlCreate.commandId]: signedUrlCreate,
  [roomFetch.commandId]: roomFetch
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

  return res
    .status(!responseData.ok ? responseData.status : HttpStatus.OK)
    .json(responseData);
};
