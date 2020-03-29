import { NextApiRequest, NextApiResponse } from "next";
import { getPlaylist } from "../../../../src/api/collections/backend/adaptors/directus";
import { podcastXMLFromFeed } from "../../../../src/utils/podcast";

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
  const profile = req.query.profile;
  if (profile !== "elshartong") {
    return res.status(404).json({ ok: false, msg: "Not Found" });
  }
  const feed = await getPlaylist(profile);
  if (feed) {
    const podcastXML = podcastXMLFromFeed(profile, feed);
    // TODO: Add CDN caching
    res.setHeader("Content-type", "text/xml;charset=UTF-8");
    return res.send(podcastXML);
  }
  return res.status(404).json({ ok: false, msg: "Not Found" });
};
