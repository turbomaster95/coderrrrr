import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function (req: VercelRequest, res: VercelResponse) {
  const { resource } = req.query;
  res.statusCode = 200;
  res.setHeader("Content-Type", `application/jrd+json`);
  res.end(`{
  "subject": "acct:blog@coderrrrr.site",
  "aliases": [
    "https://coderrrrr.site/blog",
    "https://coderrrrr.site/@blog"
  ],
  "links": [
    {
      "rel": "http://webfinger.net/rel/profile-page",
      "type": "text/html",
      "href": "https://coderrrrr.site/blog"
    },
    {
      "rel": "self",
      "type": "application/activity+json",
      "href": "https://coderrrrr.site/blog"
    },
    {
      "rel": "http://ostatus.org/schema/1.0/subscribe",
      "template": "https://coderrrrr.site/authorize_interaction?uri={uri}"
    },
    {
      "rel": "http://webfinger.net/rel/avatar",
      "type": "image/png",
      "href": "https://files.usr.cloud/v1/AUTH_f22cbcf5b3904990be9696691ff73fc6/files.usr.cloud/accounts/avatars/113/822/701/816/479/941/original/7d7f6088ba1ddd57.png"
    }
  ]
}`);
}
