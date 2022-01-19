import { instance } from 'gcp-metadata';

import { TokenCache, TokenPayload, TokenRaw } from './token.types';
import { decodeSaToken } from './utils';

export type GoogleSaIdTokenOptions = {
  serviceAccountEmail?: string;

  // this margin will be subtracted from actuall
  // token exp, to avoid almost expired token
  tokenExpiryMargin?: number;
};

export class GoogleSaIdToken {
  readonly sa: string;
  readonly tokenExpiryMargin: number;

  private tokenCache: Record<string, Promise<TokenCache>> = {};

  constructor({ serviceAccountEmail, tokenExpiryMargin }: GoogleSaIdTokenOptions = {}) {
    this.sa = serviceAccountEmail || 'default';
    this.tokenExpiryMargin = tokenExpiryMargin || 2000;
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
    if (!cache || this.isTokenExpired(cache.payload)) {
      const promise = (this.tokenCache[aud] = this.fetchIdTokenNoCache(aud));

      return rawOrDecoded(await promise, withDecoded);
    }

    return rawOrDecoded(cache, withDecoded);
  }

  isTokenExpired({ exp }: TokenPayload): boolean {
    return exp - this.tokenExpiryMargin <= Date.now();
  }
}

function rawOrDecoded(
  value: TokenCache,
  withDecoded?: boolean
): TokenRaw | { raw: TokenRaw; payload: TokenPayload } {
  return withDecoded ? value : value.raw;
}
