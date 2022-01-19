import { mockGetSaIdToken, mockLifeCycle, mockNodeFetch } from './utils/mocks';

const mock = mockNodeFetch();

import { wait } from 'better-wait';

import { GoogleSaIdToken } from '../src/google-sa-id-token';
import { generateExampleSaToken } from '../src/utils/generate-example-sa-token';

describe('GoogleSaIdToken', () => {
  mockLifeCycle(mock);

  describe('fetchIdToken', () => {
    it('fetches new valid token first time, and then returns cached', async () => {
      const aud = 'test';
      const mockToken = generateExampleSaToken({ aud });
      const isDone = mockGetSaIdToken(mock, mockToken.raw, aud);

      const client = new GoogleSaIdToken();

      const first = await client.fetchIdToken(aud);
      const second = await client.fetchIdToken(aud);

      isDone();

      expect(first).toEqual(mockToken.raw);
      expect(second).toEqual(mockToken.raw);
    });

    it('caches tokens by audience', async () => {
      const aud1 = 'test1';
      const aud2 = 'test2';
      const mockToken1 = generateExampleSaToken({ aud: aud1 });
      const mockToken2 = generateExampleSaToken({ aud: aud2 });

      const isDone1 = mockGetSaIdToken(mock, mockToken1.raw, aud1);

      const client = new GoogleSaIdToken();

      const firstAud1 = await client.fetchIdToken(aud1);
      const secondAud1 = await client.fetchIdToken(aud1);

      isDone1();

      expect(firstAud1).toEqual(mockToken1.raw);
      expect(secondAud1).toEqual(mockToken1.raw);

      const isDone2 = mockGetSaIdToken(mock, mockToken2.raw, aud2);

      const firstAud2 = await client.fetchIdToken(aud2);
      const secondAud2 = await client.fetchIdToken(aud2);

      isDone2();

      expect(firstAud2).toEqual(mockToken2.raw);
      expect(secondAud2).toEqual(mockToken2.raw);

      expect(firstAud1).not.toEqual(firstAud2);
    });

    it('refreshes token, if it was expired', async () => {
      const aud = 'test';
      const aboutToExpireToken = generateExampleSaToken({
        aud,
        exp: Date.now(),
      });
      const validToken = generateExampleSaToken({ aud });

      const isDone1 = mockGetSaIdToken(mock, aboutToExpireToken.raw, aud);

      const client = new GoogleSaIdToken();

      const expired = await client.fetchIdToken(aud);
      await wait('1s');

      isDone1();
      expect(expired).toEqual(aboutToExpireToken.raw);

      const isDone2 = mockGetSaIdToken(mock, validToken.raw, aud, 'test-2');
      const fresh = await client.fetchIdToken(aud);

      isDone2();
      expect(fresh).toEqual(validToken.raw);
    });

    it('return decoded token, if specified', async () => {
      const aud = 'test';

      const validToken = generateExampleSaToken({ aud });
      const client = new GoogleSaIdToken();
      const isDone = mockGetSaIdToken(mock, validToken.raw, aud);

      const token = await client.fetchIdToken(aud, { withDecoded: true });

      isDone();
      expect(token).toEqual(validToken);
    });
  });
});
