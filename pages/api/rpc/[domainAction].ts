import { NextApiRequest, NextApiResponse } from "next";
import { IResponse, ERR } from "../../../src/api/IResponse";
import HttpStatus from "http-status-codes";
import signedUrlCreate from "../../../src/api/rpc/commands/signedurl.create";
import episodeCreate from "../../../src/api/rpc/commands/episode.create";
import episodeUpdate from "../../../src/api/rpc/commands/episode.update";
import roomFetch from "../../../src/api/rpc/commands/room.fetch";

const handlers = {
  [episodeCreate.commandId]: episodeCreate,
  [episodeUpdate.commandId]: episodeUpdate,
  [signedUrlCreate.commandId]: signedUrlCreate,
  [roomFetch.commandId]: roomFetch,
};

export default async (
  req: NextApiRequest,
  res: NextApiResponse<IResponse<any>>
) => {
  const domainAction = req.query.domainAction as string;

  let responseData = ERR("No RPC found to handle", HttpStatus.NOT_IMPLEMENTED);

  if (handlers[domainAction]) {
    responseData = await handlers[domainAction].handle(req.body);
  }

  return res
    .status(!responseData.ok ? responseData.status : HttpStatus.OK)
    .json(responseData);
};
