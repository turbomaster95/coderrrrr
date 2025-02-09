import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function (req: VercelRequest, res: VercelResponse) {
  const { headers } = req;

  if (headers.accept && headers.accept.includes("text/html")) {
    res.redirect(302, "https://coderrrrr.site/");
    return;
  }

  res.status(200).setHeader("Content-Type", "application/activity+json").json({
    "@context": ["https://www.w3.org/ns/activitystreams", { "@language": "en-US" }],
    "type": "Person",
    "id": "https://coderrrrr.site/blog",
    "outbox": "https://coderrrrr.site/api/activitypub/outbox",
    "following": "https://coderrrrr.site/api/activitypub/following",
    "followers": "https://coderrrrr.site/api/activitypub/followers",
    "sharedInbox": "https://coderrrrr.site/api/activitypub/sharedInbox",
    "inbox": "https://coderrrrr.site/api/activitypub/inbox",
    "preferredUsername": "blog",
    "name": "Deva Midhun's blog",
    "discoverable": true,
    "indexable": true,
    "summary": "Software developer & self-hosting enthusiast.",
    "icon": {
      "type": "Image",
      "mediaType": "image/png",
      "url": "https://i.ibb.co/N6J5b8WS/download20250102015611.png"
    },
    "url": [
      {
        "type": "Link",
        "mediaType": "text/html",
        "href": "https://coderrrrr.site",
        "name": "Website"
      },
      {
        "type": "Link",
        "mediaType": "text/html",
        "href": "https://github.com/turbomaster95",
        "name": "GitHub"
      },
      {
        "type": "Link",
        "mediaType": "text/html",
        "href": "https://usr.cloud/@coder",
        "name": "Owner"
      }
    ],
    "publicKey": {
      "@context": "https://w3id.org/security/v1",
      "@type": "Key",
      "id": "https://coderrrrr.site/blog#main-key",
      "owner": "https://coderrrrr.site/blog",
      "publicKeyPem": process.env.ACTIVITYPUB_PUBLIC_KEY || "MISSING_PUBLIC_KEY"
    }
  });
}
