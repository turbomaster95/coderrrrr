import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AP } from 'activitypub-core-types';
import { CoreObject, EntityReference } from 'activitypub-core-types/lib/activitypub/index.js';

import admin from 'firebase-admin';

import type { Readable } from 'node:stream';
import { v4 as uuid } from 'uuid';
import { fetchActorInformation } from '../../lib/activitypub/utils/fetchActorInformation.js';
import { parseSignature } from '../../lib/activitypub/utils/parseSignature.js';
import { sendSignedRequest } from '../../lib/activitypub/utils/sendSignedRequest.js';
import { verifySignature } from '../../lib/activitypub/utils/verifySignature.js';

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

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function (req: VercelRequest, res: VercelResponse) {
  const { body, query, method, url, headers } = req;

  res.statusCode = 200;
  res.setHeader("Content-Type", `application/activity+json`);

  // Verify the message some how.
  const buf = await buffer(req);
  const rawBody = buf.toString('utf8');

  const message = <AP.Activity>JSON.parse(rawBody);

  if (message.type == "Delete") {
    // Ignore deletes for now.
    return res.end("delete")
  }

  console.log(message);

  const signature = parseSignature(req);
  const actorInformation = await fetchActorInformation(signature.keyId);

  if(actorInformation == undefined || actorInformation == null) {
    console.log("Actor information is null");
    res.end('actor information is null');
    return;
  }

  const signatureValid = verifySignature(signature, actorInformation.publicKey);

  if (signatureValid == null || signatureValid == false) {
    console.log("invalid signature");
    res.end('invalid signature');
    return;
  }

  if (actorInformation != null) {
    await saveActor(actorInformation);
    // Add the actor information to the message so that it's saved directly.
    message.actor = actorInformation;
  }

  console.log(message.type);

  // We should check the digest.
  if (message.type == "Follow" && actorInformation != null) {
    // We are following.
    await saveFollow(<AP.Follow>message, actorInformation);
  }

  if (message.type == "Like") {
    await saveLike(<AP.Like>message);
  }

  if (message.type == "Announce") {
    await saveAnnounce(<AP.Announce>message);
  }

  if (message.type == "Create") {
    console.log("Message type Create")
    // Someone is sending us a message. 
    const createMessage = <AP.Create>message;

    if (createMessage == null || createMessage.id == null) return;
    if (createMessage.object == null) return;
    // We only interested in Replies - that is a "note" with a "replyTo"
    const createObject = <CoreObject>createMessage.object
    if (createObject.type == "Note" && createObject.inReplyTo != undefined) {
      await saveReply(<AP.Create>createMessage);
    }
  }

  if (message.type == "Undo") {
    // Undo a follow.
    const undoObject: AP.Undo = <AP.Undo>message;
    if (undoObject == null || undoObject.id == null) return;
    if (undoObject.object == null) return;
    if ("actor" in undoObject.object == false) return;

    if ((<CoreObject>undoObject.object).type == "Follow") {
      await removeFollow(<AP.Follow>undoObject);
    }

    if ((<CoreObject>undoObject.object).type == "Like") {
      await removeLike(<AP.Like>undoObject);
    }

    if ((<CoreObject>undoObject.object).type == "Announce") {
      await removeAnnounce(<AP.Announce>undoObject);
    }
  }

  if (message.type == "Update") {
    // TODO: We need to update the messages
    console.log("Update message", message);
  }

  res.end("ok");
};

const getActorId = (actor: AP.EntityReference): string => {
  if (typeof actor == "string") {
    return actor;
  }
  else if (actor instanceof URL) {
    return actor.toString()
  }
  else {
    return (actor.id || "").toString();
  }
}

async function removeFollow(message: AP.Follow) {
  // If from Mastodon - someone unfollowed me, we need to delete it from the store.
  const docId = getActorId(<EntityReference>message.actor).replace(/\//g, "_");

  console.log("DocId to delete", docId);

  const res = await db.collection('followers').doc(docId).delete();

  console.log("Deleted", res);
}

async function removeLike(message: AP.Like) {
  // If from Mastodon - someone un-liked the post. We need to delete it from the store.
  /*
   {
     '@context': 'https://www.w3.org/ns/activitystreams',
     id: 'https://coderrrrr.site/@blog#likes/854/undo',
     type: 'Undo',
     actor: 'https://coderrrrr.site/@blog',
     object: {
       id: 'https://coderrrrr.site/@blog#likes/854',
       type: 'Like',
       actor: 'https://coderrrrr.site/@blog',
       object: 'https://coderrrrr.site/thoughts-on-web-follow/'
     }
   }
  */
  const doc = message.object?.object.toString().replace(/\//g, "_");
  const actorId = message.object?.id.toString().replace(/\//g, "_");

  console.log(`Attempting to delete Like ${actorId} on ${doc}`);

  const res = await db.collection('likes').doc(doc).collection('messages').doc(actorId).delete();

  console.log(`Deleted Like ${actorId} on ${doc}`, res);
}

async function removeAnnounce(message: AP.Announce) {
  // If from Mastodon - someone un-liked the post. We need to delete it from the store.
  const object = message.object as EntityReference;
  const doc = object?.object.toString().replace(/\//g, "_");
  const actorId = object?.id.toString().replace(/\//g, "_");

  console.log(`Attempting to delete Announce ${actorId} on ${doc}`);

  const res = await db.collection('announces').doc(doc).collection('messages').doc(actorId).delete();

  console.log(`Deleted Announce ${actorId} on ${doc}`, res);
}

// Save the Actor objects so that we have a cache of them.
// Note: We will be embeddeding the actor information in the messages for saving directly so we can do less reads.
async function saveActor(message: AP.Actor) {
  if (message.id == null) return;
  const collection = db.collection('actors');
  const actorId = message.id.toString().replace(/\//g, "_");

  const actorDocRef = collection.doc(actorId);

  // Create the follow;
  await actorDocRef.set(message); // Always update the actor.
}

async function saveFollow(message: AP.Follow, actorInformation: AP.Actor) {
  if (message.id == null) return;

  const collection = db.collection('followers');

  const actorID = getActorId(<EntityReference>message.actor).toString();
  const followDocRef = collection.doc(actorID.replace(/\//g, "_"));
  const followDoc = await followDocRef.get();

  if (followDoc.exists) {
    console.log("Already Following");
    return;
  }

  // Create the follow;
  await followDocRef.set(message);

  const guid = uuid();
  const domain = 'coderrrrr.site';

  const acceptRequest: AP.Accept = <AP.Accept><unknown>{
    "@context": "https://www.w3.org/ns/activitystreams",
    'id': `https://${domain}/${guid}`,
    'type': 'Accept',
    'actor': "https://coderrrrr.site/@blog",
    'object': (message.actor as CoreObject).id
  };

  const actorInbox = new URL(<URL>actorInformation.inbox);

  const response = await sendSignedRequest(actorInbox, acceptRequest);

  console.log("Following result", response.status, response.statusText, await response.text());
}

async function saveLike(message: AP.Like) {
  // If from Mastodon - someone liked the post.
  const collection = db.collection('likes');

  // We should do some checks 
  // 1. TODO: in reply to is against a post that I made.

  console.log("Save Like", message);

  /* 
    We store likes as a collection of collections.
    Root key is the url of my messages
      Each object has a sub-collection of the specific message made by someone.
  */
  const id = (<URL>message.id).toString();
  const objectId = (<URL>message.object).toString();
  const rootDocRef = collection.doc(objectId.replace(/\//g, "_"));
  const rootDoc = await rootDocRef.get();

  if (rootDoc.exists == false) {
    console.log("Root doesn't exists, make it so.");
    await rootDocRef.set({});
  }

  const messagesCollection = rootDocRef.collection('messages');
  const messageDocRef = messagesCollection.doc(id.replace(/\//g, "_"));
  const messageDoc = await messageDocRef.get();

  if (messageDoc.exists == false) {
    console.log(`Adding message "${id}" to ${objectId}`);
    await messageDocRef.set(message);
  }
}

async function saveAnnounce(message: AP.Announce) {
  // If from Mastodon - someone boosted the post.
  const collection = db.collection('announces');

  // We should do some checks 
  // 1. TODO: in reply to is against a post that I made.

  console.log("Save Announce", message);

  /* 
    We store announces as a collection of collections.
    Root key is the url of my messages
      Each object has a sub-collection of the specific message made by someone.
  */
  const id = (<URL>message.id).toString();
  const objectId = (<URL>message.object).toString();
  const rootDocRef = collection.doc(objectId.replace(/\//g, "_"));
  const rootDoc = await rootDocRef.get();

  if (rootDoc.exists == false) {
    await rootDocRef.set({});
  }

  const messagesCollection = rootDocRef.collection('messages');
  const messageDocRef = messagesCollection.doc(id.replace(/\//g, "_"));
  const messageDoc = await messageDocRef.get();

  if (messageDoc.exists == false) {
    console.log(`Adding message "${id}" to ${objectId}`);
    await messageDocRef.set(message);
  }
}

async function saveReply(message: AP.Create) {
  // If from Mastodon - someone boosted the post.
  const collection = db.collection('replies');

  if (message.object == undefined) return;

  // We should do some checks 
  // 1. TODO: in reply to is against a post that I made.

  console.log("Save Reply", message);

  /* 
    We store announces as a collection of collections.
    Root key is the url of my messages
      Each object has a sub-collection of the specific message made by someone.
  */
  const objectId = (<URL>(<CoreObject>message.object).inReplyTo).toString();
  const rootDocRef = collection.doc(objectId.replace(/\//g, "_"));
  const rootDoc = await rootDocRef.get();

  if (rootDoc.exists == false) {
    await rootDocRef.set({});
  }

  const messagesCollection = rootDocRef.collection('messages');

  const id = (<URL>message.id).toString();
  const messageDocRef = messagesCollection.doc(id.replace(/\//g, "_"));
  const messageDoc = await messageDocRef.get();

  if (messageDoc.exists == false) {
    console.log(`Adding message "${id}" to ${objectId}`);
    await messageDocRef.set(message);
  }
}
