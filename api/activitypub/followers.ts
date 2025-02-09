import type { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    })
  });
}

const db = admin.firestore();

export default async function (req: VercelRequest, res: VercelResponse) {
  try {
    const collection = db.collection("followers");
    const snapshot = await collection.select("actor").get();

    // Map each document's "actor" field and filter out any null values.
    const actors = snapshot.docs
      .map(doc => doc.get("actor"))
      .filter(actor => actor != null);

    const output = {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://coderrrrr.site/api/activitypub/followers",
      "type": "OrderedCollection",
      "totalItems": actors.length,
      "orderedItems": actors
    };

    res.status(200)
      .setHeader("Content-Type", "application/activity+json")
      .json(output);
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
