/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  isQueryExpression,
  isQueryStringValid,
  QueryExpression,
  serializeQueryExpression,
} from '../expressions/QueryExpression';

type Action = 'Add' | 'Find' | 'Edit' | 'Delete';

export type Properties = {
  Locale?: string;
  Location?: string;
  Timezone?: string;
  Selector?: string;
  UserSettings?: Record<string, string>;
}

type Rows<T> = Array<Partial<T>>;

export type RequestBody<T = any> = {
  Action: Action;
  Properties?: Properties;
  Rows: Rows<T>;
}

export class AppSheetApiClientCore {
  private readonly log: (...args: string[]) => void;

  constructor(
    private request: <T>(url: string, applicationAccessKey: string, data?: unknown) => Promise<T>,
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

  async add<T = any>(tableName: string, rows: Rows<T>): Promise<T[]> {
    return await this.makeRequest<T>(tableName, {
      Action: 'Add',
      Rows: rows,
    });
  }

  async delete<T = any>(tableName: string, rows: Rows<T>): Promise<T[]> {
    return await this.makeRequest<T>(tableName, {
      Action: 'Delete',
      Rows: rows,
    });
  }

  async readAllRows<T = any>(tableName: string): Promise<T[]> {
    return await this.makeRequest<T>(tableName, {
      Action: 'Find',
      Rows: [],
    });
  }

  async readByKeys<T = any>(tableName: string, keys: Rows<T>): Promise<T[]> {
    return await this.makeRequest<T>(tableName, {
      Action: 'Find',
      Rows: keys,
    });
  }

  async readSelectedRows<T = any>(
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

    return await this.makeRequest<T>(tableName, {
      Action: 'Find',
      Properties: {
        Selector: selectorString,
      },
      Rows: [],
    });
  }

  async update<T = any>(tableName: string, rows: Rows<T>): Promise<T[]> {
    return await this.makeRequest<T>(tableName, {
      Action: 'Edit',
      Rows: rows,
    });
  }

  private async makeRequest<T>(
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

    try {
      return await this.request<T[]>(apiEndpoint, this.appSheetKey, payload);
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
}
