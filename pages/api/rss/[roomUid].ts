import { IERR } from "@/api/IResponse";
import roomFetch from "@/api/rpc/commands/room.fetch";
import { podcastXML } from "@/utils/podcast";
import { NextApiRequest, NextApiResponse } from "next";

type XMLString = string;

export default async (
  req: NextApiRequest,
  res: NextApiResponse<IERR | XMLString>
) => {
  const uid = req.query.roomUid as string;
  const roomFetched = await roomFetch.call({ uid });
  if (!roomFetched.ok) {
    return res.status(404).json(roomFetched);
  }

  const xml = podcastXML(roomFetched.data);
  // TODO: Add CDN caching
  res.setHeader("Content-type", "text/xml;charset=UTF-8");
  return res.send(xml);
};
