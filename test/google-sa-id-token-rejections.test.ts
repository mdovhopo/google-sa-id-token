import { GoogleSaIdToken } from '../src';

// DO NOT ADD TESTS WITH MOCK HERE, IT WILL BREAK TESTS

describe('GoogleSaIdToken (rejections)', () => {
  it('handles rejection correctly', async () => {
    const aud = 'test';
    const loggerMock = { error: jest.fn() };

    const client = new GoogleSaIdToken({ logger: loggerMock });
    // You should get this error in non Google env
    const [result] = await Promise.allSettled([client.fetchIdToken(aud)]);
    expect(result.status).toEqual('rejected');
    expect((result as PromiseRejectedResult).reason).toBeInstanceOf(Error);
    expect(loggerMock.error).toBeCalled();
  });

  it('fails, if aud was not specified', async () => {
    const client = new GoogleSaIdToken();

    await expect(client.fetchIdToken()).rejects.toThrowError();
    await expect(client.fetchIdTokenNoCache()).rejects.toThrowError();
  });
});
