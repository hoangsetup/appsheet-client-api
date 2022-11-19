import { RequestOptions } from 'https';
import * as https from 'https';

export function httpPost<T>(url: string, applicationAccessKey: string, data?: Record<string, unknown>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const options: RequestOptions = {
      method: 'POST',
      headers: {
        ApplicationAccessKey: applicationAccessKey,
        'Content-Type': 'application/json',
      },
    };
    const request = https.request(url, options, (incomingMessage) => {
      const chunks: Buffer[] = [];

      incomingMessage.on('data', (chunk) => {
        chunks.push(chunk);
      });

      incomingMessage.on('end', () => {
        const data = JSON.parse(Buffer.concat(chunks).toString());
        if (incomingMessage.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`${data.Message}. HttpStatus: 400`));
        }
      });

      incomingMessage.on('error', (error) => {
        reject(error);
      });
    });

    request.on('error', (error) => {
      reject(error);
    });

    if (data) {
      request.write(JSON.stringify(data));
    }

    request.end();
  });
}
