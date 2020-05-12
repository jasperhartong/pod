import { collectionsBackend } from "@/api/collection-storage/index";
import { IERR } from "@/api/IResponse";
import { podcastXML } from "@/utils/podcast";
import { NextApiRequest, NextApiResponse } from "next";

type XMLString = string;

export default async (
  req: NextApiRequest,
  res: NextApiResponse<IERR | XMLString>
) => {
  const roomSlug = "famhartong";
  const roomFetch = await collectionsBackend.getRoomBySlug(roomSlug);
  if (!roomFetch.ok) {
    return res.status(404).json(roomFetch);
  }

  const xml = podcastXML(roomFetch.data);
  // TODO: Add CDN caching
  res.setHeader("Content-type", "text/xml;charset=UTF-8");
  return res.send(xml);
};
