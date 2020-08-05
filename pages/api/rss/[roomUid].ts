import { IERR } from "@/api/IResponse";
import roomRss from "@/api/rpc/commands/room.rss";
import { NextApiRequest, NextApiResponse } from "next";

type XMLString = string;

export default async (
  req: NextApiRequest,
  res: NextApiResponse<IERR | XMLString>
) => {
  const uid = req.query.roomUid as string;
  const roomRssResponse = await roomRss.call({ uid });
  if (!roomRssResponse.ok) {
    return res.status(404).json(roomRssResponse);
  }

  // TODO: Add CDN caching
  res.setHeader("Content-type", "text/xml;charset=UTF-8");
  return res.send(roomRssResponse.data);
};
