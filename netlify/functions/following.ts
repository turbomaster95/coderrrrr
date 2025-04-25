import { Handler } from '@netlify/functions';

const handler: Handler = async (event, context) => {
  const output = {
    "@context": "https://www.w3.org/ns/activitystreams",
    "id": "https://coder.is-a.dev/api/activitypub/following",
    "type": "OrderedCollection",
    "totalItems": 2,
    "orderedItems": [
      "https://mastodon.social/users/coderrrrr",
      "https://usr.cloud/users/coder"
    ]
  };

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/activity+json",
    },
    body: JSON.stringify(output),
  };
};

export { handler };
