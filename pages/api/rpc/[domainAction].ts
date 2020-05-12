import { NextApiRequest, NextApiResponse } from "next";
import { IResponse, ERR } from "@/api/IResponse";
import HttpStatus from "http-status-codes";
import signedUrlCreate from "@/api/rpc/commands/signedurl.create";
import episodeCreate from "@/api/rpc/commands/episode.create";
import episodeUpdate from "@/api/rpc/commands/episode.update";
import roomFetch from "@/api/rpc/commands/room.fetch";
import playlistCreate from "@/api/rpc/commands/playlist.create";

const handlers = {
  [playlistCreate.commandId]: playlistCreate,
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
