import { instance } from 'gcp-metadata';

import { Token, TokenCache, TokenPayload, TokenRaw } from './token.types';
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

  private tokenCache: Record<string, TokenCache> = {};

  constructor({ serviceAccountEmail, tokenExpiryMargin }: GoogleSaIdTokenOptions = {}) {
    this.sa = serviceAccountEmail || 'default';
    this.tokenExpiryMargin = tokenExpiryMargin || 2000;
  }

  async fetchIdTokenNoCache(aud: string): Promise<Token> {
    const instanceOptions = {
      property: `service-accounts/${this.sa}/identity?audience=${aud}`,
    };

    const token = await instance(instanceOptions);

    return {
      raw: token,
      payload: decodeSaToken(token),
    };
  }

  private addFulfilHandler(aud: string, promise: Promise<Token>): Promise<Token> {
    promise
      .then((value) => {
        // 'token promise resolved, refresh status'
        this.tokenCache[aud].fetchTokenStatus = 'fulfilled';
        return value;
      })
      .catch(() => {
        // 'token promise rejected, refresh status'
        this.tokenCache[aud].fetchTokenStatus = 'rejected';
      });

    return promise;
  }

  private fetchIdTokenCached(aud: string, opts: { forceRefresh?: boolean } = {}): TokenCache {
    const cache = this.tokenCache[aud];

    if (opts.forceRefresh) {
      return (this.tokenCache[aud] = {
        promise: this.addFulfilHandler(aud, this.fetchIdTokenNoCache(aud)),
        fetchTokenStatus: 'pending',
      });
    }

    if (cache) {
      return cache;
    }

    return (this.tokenCache[aud] = {
      fetchTokenStatus: 'pending',
      promise: this.addFulfilHandler(aud, this.fetchIdTokenNoCache(aud)),
    });
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
    const token = this.fetchIdTokenCached(aud);

    if (token.fetchTokenStatus === 'pending') {
      return rawOrDecoded(await token.promise, withDecoded);
    }

    const { payload } = await token.promise;
    const result = this.fetchIdTokenCached(aud, {
      forceRefresh: token.fetchTokenStatus === 'rejected' || this.isTokenExpired(payload),
    });

    return rawOrDecoded(await result.promise, withDecoded);
  }

  isTokenExpired({ exp }: TokenPayload): boolean {
    return exp - this.tokenExpiryMargin <= Date.now();
  }
}

function rawOrDecoded(
  value: Awaited<TokenCache['promise']>,
  withDecoded?: boolean
): TokenRaw | { raw: TokenRaw; payload: TokenPayload } {
  return withDecoded ? value : value.raw;
}
