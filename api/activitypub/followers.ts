import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';

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
  try {
    const collection = db.collection('followers');
    const actors = await collection.select("actor").get();

    const output = {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://coderrrrr.site/api/activitypub/followers",
      "type": "OrderedCollection",
      "totalItems": actors.docs.length,
      "orderedItems": actors.docs.map(item => item.get("actor"))
    };

    res.status(200).setHeader("Content-Type", "application/activity+json").json(output);
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
