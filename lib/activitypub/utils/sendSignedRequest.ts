import { AP } from 'activitypub-core-types';
import { Sha256Signer } from '../../http-signature/index.js';
import { createHash } from 'crypto';

export async function sendSignedRequest(endpoint: URL, object: AP.Activity): Promise<Response> {
  const publicKeyId = "https://coderrrrr.site/@blog#main-key";
  const privateKey = process.env.ACTIVITYPUB_PRIVATE_KEY;

  const signer = new Sha256Signer({ publicKeyId, privateKey, headerNames: ["host", "date", "digest"] });

  const requestHeaders = {
    host: endpoint.hostname,
    date: new Date().toUTCString(),
    digest: `SHA-256=${createHash('sha256').update(JSON.stringify(object)).digest('base64')}`
  };

  // Generate the signature header
  const signature = signer.sign({
    url: endpoint,
    method: "POST",
    headers: requestHeaders
  });

  console.log("object", object);
  console.log("endpoint", endpoint);
  console.log("requestHeaders", requestHeaders);
  console.log("signature", signature);

  const response = await fetch(
    endpoint,
    {
      method: 'POST',
      body: JSON.stringify(object),
      headers: {
        'content-type': "application/activity+json",
        accept: "application/activity+json",
        ...requestHeaders,
        signature: signature
      },
      signal: AbortSignal.timeout(5000) // kill after 5 seconds
    }
  );

  return response;
}
