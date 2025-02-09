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
    "url": "https://coderrrrr.site/blog"
    "published": "2025-02-09T17:01:02Z",
    "preferredUsername": "blog",
    "name": "Deva Midhun's blog",
    "manuallyApprovesFollowers": false,
    "discoverable": true,
    "indexable": true,
    "memorial": false,
    "summary": "Software developer & self-hosting enthusiast. This is a bridge between my blog and the fediverse!",
    "tag": [],
    "icon": {
      "type": "Image",
      "mediaType": "image/png",
      "url": "https://i.ibb.co/N6J5b8WS/download20250102015611.png"
    },
    "publicKey": {
      "id": "https://coderrrrr.site/blog#main-key",
      "owner": "https://coderrrrr.site/blog",
      "publicKeyPem": process.env.ACTIVITYPUB_PUBLIC_KEY || "MISSING_PUBLIC_KEY"
    },
    "attachment": [
      {
        "type": "PropertyValue",
        "value": "<a href=\"https://coderrrrr.site\" target=\"_blank\" rel=\"nofollow noopener me\" translate=\"no\"><span class=\"invisible\">https://</span><span class=\"\">coderrrrr.site</span><span class=\"invisible\"></span></a>",
        "name": "Website"
      },
      {
        "type": "PropertyValue",
        "value": "<a href=\"https://github.com/turbomaster95\" target=\"_blank\" rel=\"nofollow noopener me\" translate=\"no\"><span class=\"invisible\">https://</span><span class=\"\">github.com/turbomaster95</span><span class=\"invisible\"></span></a>",
        "name": "GitHub"
      },
      {
        "type": "PropertyValue",
        "value": "<a href=\"https://usr.cloud/@coder\" target=\"_blank\" rel=\"nofollow noopener me\" translate=\"no\"><span class=\"invisible\">https://</span><span class=\"\">usr.cloud/@coder</span><span class=\"invisible\"></span></a>",
        "name": "Owner"
      },
      {
        "type": "PropertyValue",
        "value": "<a href=\"https://keyoxide.org/6389542B98CB868DAC73A373ED1190B780583CF6\" target=\"_blank\" rel=\"nofollow noopener me\" translate=\"no\"><span class=\"invisible\">https://</span><span class=\"ellipsis\">keyoxide.org/6389542B98CB868DA</span><span class=\"invisible\">C73A373ED1190B780583CF6</span></a>",
        "name": "Keyoxide"
      }
    ]
  });
}
