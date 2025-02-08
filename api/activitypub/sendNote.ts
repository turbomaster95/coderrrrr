import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AP } from 'activitypub-core-types';
import admin from 'firebase-admin';
import { OrderedCollection } from 'activitypub-core-types/lib/activitypub/index.js';
import { sendSignedRequest } from '../../lib/activitypub/utils/sendSignedRequest.js';
import { fetchActorInformation } from '../../lib/activitypub/utils/fetchActorInformation.js';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end("Unauthorized");
  }

  const configRef = db.collection('config').doc("config");
  const config = await configRef.get();
  const lastId = config.exists ? config.data()?.lastId || "" : "";

  // Fetch notes from outbox
  const outboxResponse = await fetch("https://coderrrrr.site/api/activitypub/outbox");
  const outbox = <OrderedCollection> await outboxResponse.json();

  const followersSnapshot = await db.collection('followers').get();
  let lastSuccessfulSentId = "";

  const inboxes = new Set<string>(); // Track unique inboxes to avoid duplicate sending

  for (const followerDoc of followersSnapshot.docs) {
    const follower = followerDoc.data();
    const actorUrl = typeof follower.actor === "string" ? follower.actor : follower.actor.id;

    console.log(`Fetching actor information for ${actorUrl}`);
    const actorInformation = await fetchActorInformation(actorUrl);
    if (!actorInformation || !actorInformation.inbox) {
      console.log(`Skipping ${actorUrl}: No valid inbox`);
      continue;
    }

    const inboxUrl = actorInformation.sharedInbox || actorInformation.inbox;
    inboxes.add(inboxUrl.toString()); // Add to set to ensure unique delivery
  }

  for (const item of <AP.EntityReference[]>outbox.orderedItems) {
    if (item.id === lastId) {
      console.log(`${item.id} has already been posted - skipping`);
      break;
    }

    if (item.object) {
      item.object.published = new Date().toISOString();
    }

    for (const inboxUrl of inboxes) {
      try {
        console.log(`Sending to ${inboxUrl}`);

        const response = await sendSignedRequest(new URL(inboxUrl), <AP.Activity> item, {
          headers: {
            "Accept": "application/activity+json",
            "Content-Type": "application/activity+json"
          }
        });

        console.log(`Send result: ${response.status} ${response.statusText}`);
        const responseText = await response.text();
        console.log("Response body:", responseText);

        lastSuccessfulSentId = item.id;
      } catch (error) {
        console.error(`Error sending to ${inboxUrl}:`, error);
      }
    }
    break; // Only send the latest post for now
  }

  await configRef.set({ "lastId": lastSuccessfulSentId });

  res.status(200).end("ok");
};
