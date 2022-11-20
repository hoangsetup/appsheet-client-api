import * as https from 'https';
import { ClientRequest, IncomingMessage } from 'http';
import { httpPost } from './NodeHttpClient';
import { EventEmitter } from 'events';

describe('NodeHttpClient', () => {
  describe('fetchPost()', () => {
    const url = 'api-url';
    const applicationAccessKey = 'application-access-key';
    const payload = { foo: 'baz' };
    let clientRequest: ClientRequest;
    let incomingMessage: IncomingMessage;

    beforeEach(() => {
      clientRequest = new EventEmitter() as ClientRequest;
      clientRequest.write = jest.fn();
      clientRequest.end = jest.fn();
      incomingMessage = new EventEmitter() as IncomingMessage;
      incomingMessage.statusCode = 200;

      jest.spyOn(https, 'request').mockImplementation((url, options, callback) => {
        if (callback) {
          callback(incomingMessage);
        }
        return clientRequest;
      });
    });

    it('should call https.fetchPost() and write data to the fetchPost', async () => {
      const promise = httpPost(url, applicationAccessKey, payload);
      incomingMessage.emit('data', Buffer.from(JSON.stringify({})));
      incomingMessage.emit('end');
      await promise;

      expect(https.request).toHaveBeenCalledWith(
        url,
        {
          method: 'POST',
          headers: {
            ApplicationAccessKey: applicationAccessKey,
            'Content-Type': 'application/json',
          },
        },
        expect.any(Function),
      );
      expect(clientRequest.write).toHaveBeenCalledWith(JSON.stringify(payload));
      expect(clientRequest.end).toHaveBeenCalled();
    });

    it('should resolve with response object', async () => {
      const promise = httpPost(url, applicationAccessKey, payload);
      incomingMessage.emit('data', Buffer.from('[{"key":'));
      incomingMessage.emit('data', Buffer.from('"value"}]'));
      incomingMessage.emit('end');

      await expect(promise).resolves.toEqual([{ key: 'value' }]);
    });

    it('should reject with error when status code is not 200', async () => {
      const response = { Message: 'error message '};
      incomingMessage.statusCode = 400;

      const promise = httpPost(url, applicationAccessKey, payload);
      incomingMessage.emit('data', Buffer.from(JSON.stringify(response)));
      incomingMessage.emit('end');

      await expect(promise).rejects.toThrow(`${response.Message}. HttpStatus: 400`);
    });

    it('should handle response error event', async () => {
      const error = new Error('response-error');

      const promise = httpPost(url, applicationAccessKey, payload);
      incomingMessage.emit('error', error);

      await expect(promise).rejects.toThrow(error);
    });

    it('should handle fetchPost error event', async () => {
      const error = new Error('fetchPost-error');

      const promise = httpPost(url, applicationAccessKey, payload);
      clientRequest.emit('error', error);

      await expect(promise).rejects.toThrow(error);
    });
  });
});
