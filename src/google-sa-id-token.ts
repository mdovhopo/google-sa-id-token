import { instance } from 'gcp-metadata';

import { TokenCache, TokenPayload, TokenRaw } from './token.types';

export type GoogleSaIdTokenOptions = {
  serviceAccountEmail?: string;
};

export class GoogleSaIdToken {
  readonly sa: string;

  private tokenCache: Record<string, Promise<TokenCache>> = {};

  constructor({ serviceAccountEmail }: GoogleSaIdTokenOptions = {}) {
    this.sa = serviceAccountEmail || 'default';
  }

  async fetchIdTokenNoCache(aud: string): Promise<{ raw: TokenRaw; payload: TokenPayload }> {
    const instanceOptions = {
      property: `service-accounts/${this.sa}/token?format=full&audience=${aud}`,
    };

    const token = await instance(instanceOptions);

    return {
      raw: token,
      payload: decodeSaToken(token),
    };
  }

  async fetchIdToken(aud: string): Promise<TokenRaw>;
  async fetchIdToken(
    aud: string,
    opts?: { withDecoded?: boolean }
  ): Promise<{ raw: TokenRaw; payload: TokenPayload }>;
  async fetchIdToken(
    aud: string,
    { withDecoded = false } = {}
  ): Promise<TokenRaw | { raw: TokenRaw; payload: TokenPayload }> {
    const cache = await this.tokenCache[aud];
    if (!cache || isTokenExpired(cache.payload)) {
      const promise = (this.tokenCache[aud] = this.fetchIdTokenNoCache(aud));

      return rawOrDecoded(await promise, withDecoded);
    }

    return rawOrDecoded(cache, withDecoded);
  }
}

function isTokenExpired(token: TokenPayload): boolean {
  // add 2s margin to token check, to avoid calls with
  // almost expired token
  return token.exp - 2000 <= Date.now();
}

function rawOrDecoded(
  value: TokenCache,
  withDecoded?: boolean
): TokenRaw | { raw: TokenRaw; payload: TokenPayload } {
  return withDecoded ? value : value.raw;
}

function decodeSaToken(token: TokenRaw): TokenPayload {
  const [, payload] = token.split('.');
  return JSON.parse(Buffer.from(payload, 'base64url').toString());
}
