import { ERR, IResponse } from "@/api/IResponse";
import episodeCreate from "@/api/rpc/commands/episode.create";
import episodeDelete from "@/api/rpc/commands/episode.delete";
import episodeUpdate from "@/api/rpc/commands/episode.update";
import playlistCreate from "@/api/rpc/commands/playlist.create";
import roomAll from "@/api/rpc/commands/room.all";
import roomCreate from "@/api/rpc/commands/room.create";
import roomFetch from "@/api/rpc/commands/room.fetch";
import roomImport from "@/api/rpc/commands/room.import";
import roomRss from "@/api/rpc/commands/room.rss";
import signedUrlCreate from "@/api/rpc/commands/signedurl.create";
import HttpStatus from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

const handlers = {
  [playlistCreate.commandId]: playlistCreate,
  [episodeCreate.commandId]: episodeCreate,
  [episodeUpdate.commandId]: episodeUpdate,
  [episodeDelete.commandId]: episodeDelete,
  [signedUrlCreate.commandId]: signedUrlCreate,
  [roomFetch.commandId]: roomFetch,
  [roomCreate.commandId]: roomCreate,
  [roomImport.commandId]: roomImport,
  [roomAll.commandId]: roomAll,
  [roomRss.commandId]: roomRss,
};

export default async (
  req: NextApiRequest,
  res: NextApiResponse<IResponse<any>>
) => {
  const domainAction = req.query.domainAction as string;

  let responseData = ERR("No RPC found to handle", HttpStatus.NOT_IMPLEMENTED);

  if (handlers[domainAction]) {
    responseData = await handlers[domainAction].handleUnsafe(req.body);
  }

  return res
    .status(!responseData.ok ? responseData.status : HttpStatus.OK)
    .json(responseData);
};
