import { NextApiRequest, NextApiResponse } from "next";
import * as feedCount from "../../../src/api/episode.count";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { domainAction } = req.query;
  const reqData = req.body;
  const [domain, action] = (domainAction as string).split(".");

  if (feedCount.domain === domain && feedCount.action === action) {
    feedCount.handle(reqData);
  }

  return res.json({ ok: true, domain: domain, action: action });
};
