exports.handler = async (event, context) => {
  const headers = event.headers;

  if (headers.accept && headers.accept.includes("text/html")) {
    return {
      statusCode: 302,
      headers: {
        Location: "https://coder.is-a.dev/"
      },
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/activity+json"
    },
    body: JSON.stringify({
      "@context": ["https://www.w3.org/ns/activitystreams", { "@language": "en-US" }],
      "type": "Person",
      "id": "https://coder.is-a.dev/@blog",
      "outbox": "https://coder.is-a.dev/api/activitypub/outbox",
      "following": "https://coder.is-a.dev/api/activitypub/following",
      "followers": "https://coder.is-a.dev/api/activitypub/followers",
      "sharedInbox": "https://coder.is-a.dev/api/activitypub/sharedInbox",
      "inbox": "https://coder.is-a.dev/api/activitypub/inbox",
      "url": "https://coder.is-a.dev/@blog",
      "published": "2024-05-02T15:25:40Z",
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
        "id": "https://coder.is-a.dev/@blog#main-key",
        "owner": "https://coder.is-a.dev/@blog",
        "publicKeyPem": process.env.ACTIVITYPUB_PUBLIC_KEY || "MISSING_PUBLIC_KEY"
      },
      "attachment": [
        {
          "type": "PropertyValue",
          "value": "<a href=\"https://coder.is-a.dev\" target=\"_blank\" rel=\"nofollow noopener me\" translate=\"no\"><span class=\"invisible\">https://</span><span class=\"\">coder.is-a.dev</span><span class=\"invisible\"></span></a>",
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
    })
  };
};
