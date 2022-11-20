import { AppSheetApiClientCore, Properties } from '../AppSheetApiClientCore';
import { fetchPost } from '../BrowserHttpClient';

export class AppSheetApiClient extends AppSheetApiClientCore {
  constructor(
    appSheetAppId: string,
    appSheetKey: string,
    properties: Omit<Properties, 'Selector'>,
    enableDebugMode?: boolean,
  ) {
    super(fetchPost, appSheetAppId, appSheetKey, properties, enableDebugMode);
  }
}
