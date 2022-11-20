import {
  isQueryExpression,
  isQueryStringValid,
  QueryExpression,
  serializeQueryExpression,
} from './QueryExpression';
import { HttpHandler } from './HttpHanlder';

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

export class AppSheetApiClientCore {
  private readonly log: (...args: string[]) => void;

  constructor(
    private request: HttpHandler,
    private appSheetAppId: string,
    private appSheetKey: string,
    private properties: Omit<Properties, 'Selector'>,
    private enableDebugMode?: boolean,
  ) {
    this.log = (...args: string[]) => {
      if (this.enableDebugMode) {
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

  readByKeys<T extends DataType = DataType>(tableName: string, keys: T[]): Promise<T[]> {
    return this.makeRequest<T>(tableName, {
      Action: 'Find',
      Rows: keys,
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

  update<T extends DataType = DataType>(tableName: string, rows: T[]): Promise<T[]> {
    return this.makeRequest<T>(tableName, {
      Action: 'Edit',
      Rows: rows,
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

    return this.request<T[]>(apiEndpoint, this.appSheetKey, payload);
  }
}
