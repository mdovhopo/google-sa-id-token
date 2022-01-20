import { GoogleSaIdToken } from '../src';

// DO NOT ADD TESTS WITH MOCK HERE, IT WILL BREAK TESTS

describe('GoogleSaIdToken (rejections)', () => {
  it('handles rejection correctly', async () => {
    const aud = 'test';

    const client = new GoogleSaIdToken();
    // You should get this error in non Google env
    const [result] = await Promise.allSettled([client.fetchIdToken(aud)]);
    expect(result.status).toEqual('rejected');
    expect((result as PromiseRejectedResult).reason?.message).toEqual(
      expect.stringContaining(
        'request to http://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/token?format=full&audience=test failed, reason: connect EHOSTDOWN 169.254.169.254:80'
      )
    );
  });
});
