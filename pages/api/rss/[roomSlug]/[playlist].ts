import { NextApiRequest, NextApiResponse } from "next";
import { podcastXML } from "../../../../src/utils/podcast";
import { collectionsBackend } from "../../../../src/api/collection-storage/index";
import { IERR } from "../../../../src/api/IResponse";

type XMLString = string;

export default async (
  req: NextApiRequest,
  res: NextApiResponse<IERR | XMLString>
) => {
  // For now use roomSlug, should of should be based on profile + playlist
  const roomSlug = req.query.roomSlug as string;
  const roomFetch = await collectionsBackend.getRoomBySlug(roomSlug);
  if (!roomFetch.ok) {
    return res.status(404).json(roomFetch);
  }

  const xml = podcastXML(roomSlug, roomFetch.data.playlists[0]);
  // TODO: Add CDN caching
  res.setHeader("Content-type", "text/xml;charset=UTF-8");
  return res.send(xml);
};
