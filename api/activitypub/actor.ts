import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function (req: VercelRequest, res: VercelResponse) {
  const { headers } = req;

  if ("accept" in headers) {
    const accept = headers["accept"];
    if (accept != null && accept.split(",").indexOf("text/html") > -1) {
      return res.redirect(302, "https://coderrrrr.site/").end();
    }
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", `application/activity+json`);
  res.json({
    "@context": ["https://www.w3.org/ns/activitystreams", { "@language": "en- US" }],
    "type": "Person",
    "id": "https://coderrrrr.site/coder",
    "outbox": "https://coderrrrr.site/outbox",
    "following": "https://coderrrrr.site/following",
    "followers": "https://coderrrrr.site/followers",
    "inbox": "https://coderrrrr.site/inbox",
    "preferredUsername": "coder",
    "name": "Deva Midhun's blog",
    "summary": "",
    "icon": {
      "type": "Image",
      "mediaType": "image/png",
      "url": "https://i.ibb.co/N6J5b8WS/download20250102015611.png"
    },
    "publicKey": {
      "@context": "https://w3id.org/security/v1",
      "@type": "Key",
      "id": "https://coderrrrr.site/coder#main-key",
      "owner": "https://coderrrrr.site/coder",
      "publicKeyPem": process.env.ACTIVITYPUB_PUBLIC_KEY
    }
  });
}
