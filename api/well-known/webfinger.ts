import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function (req: VercelRequest, res: VercelResponse) {
  // Get the resource query parameter
  const { resource } = req.query;

  if (!resource || typeof resource !== "string") {
    res.status(400).json({ error: "Missing or invalid resource parameter" });
    return;
  }

  // Expected format: acct:username@coderrrrr.site
  const match = resource.match(/^acct:([^@]+)@coderrrrr\.site$/i);
  if (!match) {
    res.status(400).json({ error: "Resource format not supported" });
    return;
  }
ṣ
  const username = match[1].toLowerCase();

  // Determine the profile URL based on the username.
  // For this example, we support only the "blog" account.
  // You can add more supported usernames as needed.
  let profileUrl: string;
  if (username === "blog") {
    profileUrl = "https://coderrrrr.site/blog";
  } else {
    // If the username is not recognized, return a 404.
    res.status(404).json({ error: "User not found" });
    return;
  }

  // Build the WebFinger response object
  const webfingerResponse = {
    subject: resource,
    aliases: [profileUrl],
    links: [
      {
        rel: "http://webfinger.net/rel/profile-page",
        type: "text/html",
        href: profileUrl
      },
      {
        rel: "self",
        type: "application/activity+json",
        href: profileUrl
      },
      // Optional: Add a subscription template if needed.
      {
        rel: "http://ostatus.org/schema/1.0/subscribe",
        template: "https://coderrrrr.site/authorize_interaction?uri={uri}"
      }
    ]
  };

  res.setHeader("Content-Type", "application/jrd+json");
  res.status(200).json(webfingerResponse);
}
