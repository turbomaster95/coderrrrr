import { Handler } from '@netlify/functions';
import { join } from 'path';
import { cwd } from 'process';
import { readFileSync } from 'fs';

const handler: Handler = async (event, context) => {
  const file = join(cwd(), 'public', 'outbox.ajson');
  const stringified = readFileSync(file, 'utf8');

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/activity+json",
    },
    body: stringified,
  };
};

export { handler };

