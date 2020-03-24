import { NextApiRequest, NextApiResponse } from "next";
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { url, utm_content } = req.query;
  if (!url) {
    return res.status(401).json({ ok: false });
  }
  console.warn(`Count download for: ${utm_content}`);
  res.writeHead(302, { Location: decodeURIComponent(url as string) });
  return res.end();
};
