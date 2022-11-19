import { fetchPost as browserFetch } from './BrowserHttpClient';
import { httpPost as nodeHttps } from './NodeHttpClient';

export function request<T>(url: string, applicationAccessKey: string, data?: Record<string, unknown>): Promise<T> {
  const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

  if (isBrowser) {
    return browserFetch(url, applicationAccessKey, data);
  }

  return nodeHttps(url, applicationAccessKey, data);
}
