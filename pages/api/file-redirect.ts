import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { rpcUrl } from "../../src/api/urls";
import { RequestData } from "../../src/api/episode.count";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { url, episodeId, playlistId } = req.query;

  if (!url) {
    return res.status(401).json({ ok: false });
  }
  const reqData: RequestData = {
    episodeId: episodeId as string,
    playlistId: playlistId as string
  };

  axios.post(rpcUrl("episode", "count"), reqData);

  res.writeHead(302, { Location: decodeURIComponent(url as string) });
  return res.end();
};
