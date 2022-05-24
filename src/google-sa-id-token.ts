import { instance } from 'gcp-metadata';

import { Token, TokenCache, TokenPayload, TokenRaw } from './token.types';
import { decodeSaToken } from './utils';

export type LoggerFn = (type: string, payload: Record<string, unknown>) => void;
export type Logger = { info?: LoggerFn; error?: LoggerFn };

export type GoogleSaIdTokenOptions = {
  serviceAccountEmail?: string;

  defaultAudience?: string;

  // this margin will be subtracted from actually
  // token exp, to avoid almost expired token
  tokenExpiryMargin?: number;

  // Optional logger instance, useful for debugging.
  // logger will be called with appropriate level
  logger?: Logger;
};

export class GoogleSaIdToken {
  readonly sa: string;
  readonly tokenExpiryMargin: number;
  readonly defaultAudience?: string;

  protected readonly logger?: Logger;

  private tokenCache: Record<string, TokenCache> = {};

  constructor({
    serviceAccountEmail,
    tokenExpiryMargin,
    defaultAudience,
    logger,
  }: GoogleSaIdTokenOptions = {}) {
    this.sa = serviceAccountEmail || 'default';
    this.tokenExpiryMargin = tokenExpiryMargin || 2000;
    this.defaultAudience = defaultAudience;
    this.logger = logger;
  }

  private noAudError(): never {
    this.logger?.error?.('noAudError', {});
    throw new Error(
      `audience is required, specify default audience in constructor or in method parameters`
    );
  }

  async fetchIdTokenNoCache(audience?: string): Promise<Token> {
    this.logger?.info?.('fetchIdTokenNoCache.audience', {});
    const aud = this.defaultAudience || audience;
    if (!aud) {
      this.noAudError();
    }

    const instanceOptions = {
      property: `service-accounts/${this.sa}/identity?audience=${aud}`,
    };

    this.logger?.info?.('fetchIdTokenNoCache.fetchToken', { instanceOptions });
    const token = await instance(instanceOptions);

    this.logger?.info?.('fetchIdTokenNoCache.result', { token });

    return {
      raw: token,
      payload: decodeSaToken(token),
    };
  }

  private addFulfilHandler(aud: string, promise: Promise<Token>): Promise<Token> {
    promise
      .then((value) => {
        this.logger?.error?.('fulfilHandler.resolved', { value });
        // 'token promise resolved, refresh status'
        this.tokenCache[aud].fetchTokenStatus = 'fulfilled';
        return value;
      })
      .catch((err) => {
        this.logger?.error?.('fulfilHandler.rejected', { err });
        // 'token promise rejected, refresh status'
        this.tokenCache[aud].fetchTokenStatus = 'rejected';
      });

    return promise;
  }

  private fetchIdTokenCached(aud: string, opts: { forceRefresh?: boolean } = {}): TokenCache {
    this.logger?.info?.('fetchIdTokenCached.called', { aud, opts });
    const cache = this.tokenCache[aud];

    if (opts.forceRefresh) {
      this.logger?.info?.('fetchIdTokenCached.forceRefresh', {});
      return (this.tokenCache[aud] = {
        promise: this.addFulfilHandler(aud, this.fetchIdTokenNoCache(aud)),
        fetchTokenStatus: 'pending',
      });
    }

    this.logger?.info?.('fetchIdTokenCached.check-cache', { cache });
    if (cache) {
      return cache;
    }

    this.logger?.info?.('fetchIdTokenCached.cache-miss', {});
    return (this.tokenCache[aud] = {
      fetchTokenStatus: 'pending',
      promise: this.addFulfilHandler(aud, this.fetchIdTokenNoCache(aud)),
    });
  }

  async fetchIdTokenDecoded(audience?: string): Promise<{ raw: TokenRaw; payload: TokenPayload }> {
    this.logger?.info?.('fetchIdTokenDecoded.called', { audience });
    const aud = this.defaultAudience || audience;
    if (!aud) {
      this.noAudError();
    }

    this.logger?.info?.('fetchIdTokenDecoded.get-cached', { audience });
    const token = this.fetchIdTokenCached(aud);

    this.logger?.info?.('fetchIdTokenDecoded.got-token-cache', { token });
    if (token.fetchTokenStatus === 'pending') {
      return await token.promise;
    }

    const { payload } = await token.promise;
    const result = this.fetchIdTokenCached(aud, {
      forceRefresh: token.fetchTokenStatus === 'rejected' || this.isTokenExpired(payload),
    });

    return await result.promise;
  }

  async fetchIdToken(audience?: string): Promise<TokenRaw> {
    this.logger?.info?.('fetchIdToken.called', { audience });
    return (await this.fetchIdTokenDecoded(audience)).raw;
  }

  isTokenExpired({ exp }: TokenPayload): boolean {
    return exp - this.tokenExpiryMargin <= Date.now();
  }
}
