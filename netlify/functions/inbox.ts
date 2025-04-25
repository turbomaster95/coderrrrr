import { Handler } from '@netlify/functions';
import { firestore } from '../../../lib/firebase';
import { verifySignature } from '../../../lib/verify';
import { handleFollow } from '../../../lib/handleFollow';

const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const inboxData = JSON.parse(event.body || '{}');
    const username = event.path.split('/')[2]; // /users/:username/inbox

    const isVerified = await verifySignature(event.headers, event.body);
    if (!isVerified) {
      return {
        statusCode: 401,
        body: 'Unauthorized',
      };
    }

    if (inboxData.type === 'Follow') {
      await handleFollow(inboxData, username);
      return {
        statusCode: 202,
        body: 'Follow request accepted',
      };
    }

    return {
      statusCode: 200,
      body: 'Activity received',
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export { handler };
