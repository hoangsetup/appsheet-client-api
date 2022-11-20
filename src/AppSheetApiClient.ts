import { AppSheetApiClientCore, Properties } from './AppSheetApiClientCore';
import { httpPost } from './NodeHttpClient';

export class AppSheetApiClient extends AppSheetApiClientCore {
  constructor(
    appSheetAppId: string,
    appSheetKey: string,
    properties: Omit<Properties, 'Selector'>,
    enableDebugMode?: boolean,
  ) {
    super(httpPost, appSheetAppId, appSheetKey, properties, enableDebugMode);
  }
}
