import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function (req: VercelRequest, res: VercelResponse) {
  const { resource } = req.query;
  res.statusCode = 200;
  res.setHeader("Content-Type", `application/jrd+json`);
  res.end(`{  
    "subject": "acct:coder@coderrrrr.site",
    "aliases": [
      "https://coderrrrr.site/@coder"
    ],
    "links": [
      {
        "rel": "self",
        "type": "application/activity+json",
        "href": "https://coderrrrr.site/coder"
      }
    ]
  }`);
}
