import { randomBytes } from 'crypto';
import ms from 'ms';

import { TokenPayload } from '../token.types';

export function randomString(length: number, encode: 'hex' | 'base64'): string {
  return randomBytes(length * 4)
    .slice(0, length)
    .toString(encode);
}

export function generateExampleSaToken(token: Partial<TokenPayload>) {
  const header = {
    alg: 'RS256',
    kid: randomString(40, 'hex'),
    typ: 'JWT',
  };
  const payload = {
    aud: 'default',
    azp: '<example-service-account-id>',
    email: 'example@project-id.iam.gserviceaccount.com',
    email_verified: true,
    exp: Date.now() + ms('1h'),
    iat: Date.now(),
    iss: 'https://accounts.google.com',
    sub: '<example-service-account-id>',
    ...token,
  };

  const encode = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  return {
    raw: `${encode(header)}.${encode(payload)}.${randomString(64, 'base64')}`,
    payload,
  };
}
