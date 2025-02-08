import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function (req: VercelRequest, res: VercelResponse) {
  const output = {
    "@context": "https://www.w3.org/ns/activitystreams",
    "id": "https://coderrrrr.site/api/activitypub/following",
    "type": "OrderedCollection",
    "totalItems": 2,
    "orderedItems": [
      "https://mastodon.social/users/coderrrrr",
      "https://usr.cloud/users/coder"
    ]
  };

  res.status(200).setHeader("Content-Type", "application/activity+json").json(output);
};
