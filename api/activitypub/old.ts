import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function (req: VercelRequest, res: VercelResponse) {
  res.status(410).json({
    error: "This account no longer exists."
  });
};
