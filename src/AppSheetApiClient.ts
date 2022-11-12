import {
  isQueryExpression,
  isQueryStringValid,
  QueryExpression,
  serializeQueryExpression,
} from './QueryExpression';
import { request } from './HttpClient';

type Action = 'Add' | 'Find' | 'Edit' | 'Delete';
type DataType = Record<string, unknown>;

export type Properties = {
  Locale?: string;
  Location?: string;
  Timezone?: string;
  Selector?: string;
  UserSettings?: Record<string, string>;
}

export type RequestBody<T extends DataType = DataType> = {
  Action: Action;
  Properties?: Properties;
  Rows: T[];
}

export class AppSheetApiClient {
  private readonly log: (...args: string[]) => void;

  constructor(
    private appSheetAppId: string,
    private appSheetKey: string,
    private properties: Omit<Properties, 'Selector'>,
  ) {
    this.log = (...args: string[]) => {
      if (String(process.env.DEBUG).includes('appsheet-api-client')) {
        console.log(...args);
      }
    };
  }

  add<T extends DataType = DataType>(tableName: string, rows: T[]): Promise<T[]> {
    return this.makeRequest<T>(tableName, {
      Action: 'Add',
      Rows: rows,
    });
  }

  delete<T extends DataType = DataType>(tableName: string, rows: Array<Partial<T>>): Promise<T[]> {
    return this.makeRequest<T>(tableName, {
      Action: 'Delete',
      Rows: rows,
    });
  }

  readAllRows<T extends DataType = DataType>(tableName: string): Promise<T[]> {
    return this.makeRequest<T>(tableName, {
      Action: 'Find',
      Rows: [],
    });
  }

  async readSelectedRows<T extends DataType = DataType>(
    tableName: string,
    selector: string | QueryExpression,
  ): Promise<T[]> {
    let selectorString: string;

    if (isQueryExpression(selector)) {
      selectorString = serializeQueryExpression(selector);
    } else {
      selectorString = selector;
    }

    if (!isQueryStringValid(selectorString)) {
      throw new Error('Number of opened and closed parentheses does not match.');
    }

    return this.makeRequest<T>(tableName, {
      Action: 'Find',
      Properties: {
        Selector: selectorString,
      },
      Rows: [],
    });
  }

  private makeRequest<T>(
    tableName: string,
    data: RequestBody,
  ): Promise<T[]> {
    const apiEndpoint = `https://api.appsheet.com/api/v2/apps/${
      this.appSheetAppId
    }/tables/${
      encodeURIComponent(tableName)
    }/Action`;
    const payload: RequestBody = {
      Properties: {
        ...this.properties,
        ...(data.Properties ? data.Properties : {}),
      },
      Action: data.Action,
      Rows: data.Rows,
    };
    this.log(`POST ${apiEndpoint}`);
    this.log(`BODY: ${JSON.stringify(payload)}`);

    return request<T[]>(apiEndpoint, this.appSheetKey, payload);
  }
}
