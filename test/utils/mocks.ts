import { sandbox } from 'fetch-mock-jest';

export const HOST_ADDRESS = 'http://169.254.169.254';
export const SECONDARY_HOST_ADDRESS = 'http://metadata.google.internal.';

export function mockGetSaIdToken(
  mock: ReturnType<typeof sandbox>,
  jwt: string,
  audience: string,
  name?: string
): () => void {
  mock.getOnce(
    {
      name,
      url:
        HOST_ADDRESS +
        '/computeMetadata/v1/instance/service-accounts/default/token?format=full&audience=' +
        audience,
      headers: { 'Metadata-Flavor': 'Google' },
    },
    { status: 200, body: jwt, headers: { 'metadata-flavor': 'Google' } }
  );

  return () => {
    expect(mock.done()).toEqual(true);
  };
}

export function mockNodeFetch(): ReturnType<typeof sandbox> {
  const mock = sandbox();
  jest.mock('node-fetch', () => mock);

  return mock;
}

export function mockLifeCycle(mock: ReturnType<typeof sandbox>): void {
  beforeAll(() => {
    // catch unmatched responses
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mock.catch((url, opts) => {
      expect({ url, opts }).toEqual('all responses must be caught');
    });
  });

  afterEach(() => {
    mock.restore();
  });
}
