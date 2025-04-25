import { Handler } from '@netlify/functions';
import { firestore } from '../../../lib/firebase';
import { fetchActorInformation } from '../../../lib/activitypub/utils/fetchActorInformation';

const handler: Handler = async (event, context) => {
  const [, , username] = event.path.split('/'); // /users/:username/followers

  try {
    const followersSnapshot = await firestore
      .collection('followers')
      .where('following', '==', username)
      .get();

    const followers = followersSnapshot.docs.map(doc => ({
      type: 'Link',
      href: doc.data().follower,
    }));

    const actor = await fetchActorInformation(username);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/activity+json',
      },
      body: JSON.stringify({
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: `${actor.id}/followers`,
        type: 'OrderedCollection',
        totalItems: followers.length,
        orderedItems: followers,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export { handler };

