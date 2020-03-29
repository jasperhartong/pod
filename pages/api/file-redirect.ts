import { NextApiRequest, NextApiResponse } from "next";
import {
  RequestData,
  ResponseData
} from "../../src/api/rpc/commands/episode.count.meta";
import rpcClient from "../../src/api/rpc/client";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { url, episodeId, playlistId } = req.query;

  if (!url) {
    return res.status(401).json({ ok: false });
  }
  const reqData: RequestData = {
    episodeId: episodeId as string,
    playlistId: playlistId as string
  };
  await rpcClient.call<RequestData, ResponseData>("episode", "count", reqData);

  res.writeHead(302, { Location: decodeURIComponent(url as string) });
  return res.end();
};
