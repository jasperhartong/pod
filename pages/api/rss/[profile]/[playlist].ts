import { NextApiRequest, NextApiResponse } from "next";
// simport { getPlaylist } from "../../../../src/api/collections/backend/adaptors/directus";
import { podcastXMLFromFeed } from "../../../../src/utils/podcast";
import { collectionsBackend } from "../../../../src/api/collection-storage/index";

interface ErrorResponse {
  ok: false;
  msg: string;
}

type SuccessResponse = string;

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse | SuccessResponse>
) => {
  // For now use profile, should of should be based on profile + playlist
  const profile = req.query.profile as string;
  const roomFetch = await collectionsBackend.getRoomBySlug(profile);
  if (!roomFetch.ok) {
    return res.status(404).json({ ok: false, msg: "Not Found" });
  }

  const podcastXML = podcastXMLFromFeed(profile, roomFetch.data.playlists[0]);
  // TODO: Add CDN caching
  res.setHeader("Content-type", "text/xml;charset=UTF-8");
  return res.send(podcastXML);
};
