import { NextApiRequest, NextApiResponse } from "next";
import { getFeedItem } from "../../../src/storage/methods";
import { podcastXMLFromFeed } from "../../../src/utils/podcast";

interface ErrorResponse {
  ok: false;
  msg: string;
}

type SuccessResponse = string;

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse | SuccessResponse>
) => {
  const { slug } = req.query;
  if (slug !== "elshartong") {
    return res.status(404).json({ ok: false, msg: "Not Found" });
  }
  const feed = await getFeedItem(slug);
  const podcastXML = podcastXMLFromFeed(slug, feed);

  // TODO: Add CDN caching
  res.setHeader("Content-type", "text/xml;charset=UTF-8");
  return res.send(podcastXML);
};
