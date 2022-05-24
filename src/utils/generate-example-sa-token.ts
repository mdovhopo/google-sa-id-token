import { randomBytes } from 'crypto';
import ms from 'ms';

import { TokenPayload } from '../token.types';

export function randomString(length: number, encode: 'hex' | 'base64'): string {
  return randomBytes(length * 4)
    .slice(0, length)
    .toString(encode);
}

const millisToSec = (m: number) => Math.floor(m / 1000);

export function generateExampleSaToken(token: Partial<TokenPayload>) {
  const header = {
    alg: 'RS256',
    kid: randomString(40, 'hex'),
    typ: 'JWT',
  };

  const now = Date.now();
  const exp = token.exp ? millisToSec(token.exp) : millisToSec(now + ms('1h'));
  const iat = token.iat ? millisToSec(token.iat) : millisToSec(now);
  const payload = {
    aud: 'default',
    azp: '<example-service-account-id>',
    email: 'example@project-id.iam.gserviceaccount.com',
    email_verified: true,
    iss: 'https://accounts.google.com',
    sub: '<example-service-account-id>',
    ...token,

    exp,
    iat,
  };

  const encode = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  return {
    raw: `${encode(header)}.${encode(payload)}.${randomString(64, 'base64')}`,
    payload,
  };
}
