// lib/firebase.ts
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);

const app = initializeApp({
  credential: cert(serviceAccount),
});

export const firestore = getFirestore(app);
