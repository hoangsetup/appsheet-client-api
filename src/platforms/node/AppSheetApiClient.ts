import { AppSheetApiClientCore, Properties } from '../../core/AppSheetApiClientCore';
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
