import * as browser from './BrowserHttpClient';
import * as https from './NodeHttpClient';
import { request } from './HttpClient';

describe('HttpClient', () => {
  const url = 'api-url';
  const applicationAccessKey = 'application-access-key';
  const payload = { foo: 'baz' };
  const responseData = { jazz: 'baz' };

  beforeEach(() => {
    jest.spyOn(browser, 'fetchPost').mockResolvedValue(responseData);
    jest.spyOn(https, 'httpPost').mockResolvedValue(responseData);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('request()', () => {
    it('should use fetchPost function when running on a browser', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).window = { document: {} };

      const actual = await request(url, applicationAccessKey, payload);

      expect(browser.fetchPost).toHaveBeenCalledWith(url, applicationAccessKey, payload);
      expect(https.httpPost).not.toHaveBeenCalled();
      expect(actual).toBe(responseData);
    });

    [
      undefined,
      { document: undefined },
    ].forEach((windowObject, index) => {
      it(`should use httpPost function when NOT running on a browser. Case(${index})`, async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (global as any).window = windowObject;

        const actual = await request(url, applicationAccessKey, payload);

        expect(browser.fetchPost).not.toHaveBeenCalled();
        expect(https.httpPost).toHaveBeenCalledWith(url, applicationAccessKey, payload);
        expect(actual).toBe(responseData);
      });
    });
  });
});
