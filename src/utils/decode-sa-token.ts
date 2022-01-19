import { TokenPayload, TokenRaw } from '../token.types';

export function decodeSaToken(token: TokenRaw): TokenPayload {
  const [, payload] = token.split('.');
  return JSON.parse(Buffer.from(payload, 'base64url').toString());
}
