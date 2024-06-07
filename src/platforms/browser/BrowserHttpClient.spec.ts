import { fetchPost } from './BrowserHttpClient';

describe('BrowserHttpClient', () => {
  const url = 'api-url';
  const applicationAccessKey = 'application-access-key';
  const payload = { foo: 'baz' };
  const responseData = { jazz: 'baz' };

  let fetchSpy:  jest.SpyInstance<Promise<Response>, [input: RequestInfo | URL, init?: RequestInit | undefined]>

  beforeEach(() => {
    fetchSpy = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue(responseData),
    } as unknown as Response);

    global.fetch = fetchSpy as unknown as typeof global.fetch;
  });

  describe('fetchPost()', () => {
    it('should fetch with body when payload is provided', async () => {
      const actual = await fetchPost(url, applicationAccessKey, payload);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'POST',
        headers: {
          ApplicationAccessKey: applicationAccessKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      expect(actual).toBe(responseData);
    });

    it('should fetch without body when payload is NOT provided', async () => {
      const actual = await fetchPost(url, applicationAccessKey);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'POST',
        headers: {
          ApplicationAccessKey: applicationAccessKey,
          'Content-Type': 'application/json',
        },
        body: null,
      });
      expect(actual).toBe(responseData);
    });

    it('should throw error when response status is not 200', async () => {
      const detail = 'Error detail';
      const errorResponse = { detail };
      fetchSpy.mockResolvedValue({
        status: 400,
        json: jest.fn().mockResolvedValue(errorResponse),
      } as unknown as Response);

      const promise = fetchPost(url, applicationAccessKey);

      await expect(promise).rejects.toThrow(`(400) ${detail}`);
    });
  });
});
