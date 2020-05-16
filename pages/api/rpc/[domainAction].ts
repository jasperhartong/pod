import { ERR, IResponse } from "@/api/IResponse";
import episodeCreate from "@/api/rpc/commands/episode.create";
import episodeUpdate from "@/api/rpc/commands/episode.update";
import playlistCreate from "@/api/rpc/commands/playlist.create";
import roomCreate from "@/api/rpc/commands/room.create";
import roomFetch from "@/api/rpc/commands/room.fetch";
import signedUrlCreate from "@/api/rpc/commands/signedurl.create";
import HttpStatus from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

const handlers = {
  [playlistCreate.commandId]: playlistCreate,
  [episodeCreate.commandId]: episodeCreate,
  [episodeUpdate.commandId]: episodeUpdate,
  [signedUrlCreate.commandId]: signedUrlCreate,
  [roomFetch.commandId]: roomFetch,
  [roomCreate.commandId]: roomCreate,
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
