import { AppSheetApiClient, Properties, RequestBody } from './AppSheetApiClient';
import * as httpClient from './HttpClient';
import * as QE from './QueryExpression';
import { QueryExpression } from './QueryExpression';
import mocked = jest.mocked;

describe('AppSheetApiClient', () => {
  const appId = 'app-id';
  const key = 'app-access-key';
  const properties: Properties = {
    Locale: 'ja_JP',
  };
  const tableName = 'Unicode Table Name: Bảng của tôi';
  const expectedUrl = `https://api.appsheet.com/api/v2/apps/${
    appId
  }/tables/${
    encodeURIComponent(tableName)
  }/Action`;
  const rows = 'rows' as unknown as Array<Record<string, unknown>>;
  const response = 'response';
  let client: AppSheetApiClient;

  beforeEach(() => {
    process.env.DEBUG = 'appsheet-api-client';
    client = new AppSheetApiClient(appId, key, properties);
    jest.spyOn(httpClient, 'request').mockResolvedValue(response);
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('add()', () => {
    it('should call request with Add action', async () => {
      const actual = await client.add(tableName, rows);

      expect(httpClient.request).toHaveBeenCalledWith(
        expectedUrl,
        key,
        {
          Properties: {
            ...properties,
          },
          Action: 'Add',
          Rows: rows,
        } as RequestBody,
      );
      expect(actual).toBe(response);
    });
  });

  describe('delete()', () => {
    it('should call request with Delete action', async () => {
      const actual = await client.delete(tableName, rows);

      expect(httpClient.request).toHaveBeenCalledWith(
        expectedUrl,
        key,
        {
          Properties: {
            ...properties,
          },
          Action: 'Delete',
          Rows: rows,
        } as RequestBody,
      );
      expect(actual).toBe(response);
    });
  });

  describe('readAllRows()', () => {
    it('should call request with Find action', async () => {
      const actual = await client.readAllRows(tableName);

      expect(httpClient.request).toHaveBeenCalledWith(
        expectedUrl,
        key,
        {
          Properties: {
            ...properties,
          },
          Action: 'Find',
          Rows: [],
        } as RequestBody,
      );
      expect(actual).toBe(response);
    });
  });

  describe('readByKeys()', () => {
    it('should call request with Find action', async () => {
      const keys = [{ ID: '1' }, { ID: '2' }];
      const actual = await client.readByKeys(tableName, keys);

      expect(httpClient.request).toHaveBeenCalledWith(
        expectedUrl,
        key,
        {
          Properties: {
            ...properties,
          },
          Action: 'Find',
          Rows: keys,
        } as RequestBody,
      );
      expect(actual).toBe(response);
    });
  });

  describe('readSelectedRows()', () => {
    beforeEach(() => {
      jest.spyOn(QE, 'isQueryExpression');
      jest.spyOn(QE, 'serializeQueryExpression');
      jest.spyOn(QE, 'isQueryStringValid').mockReturnValue(true);
    });

    it('should call request with Find action when selector is a string', async () => {
      const selector = 'selector';
      mocked(QE.isQueryExpression).mockReturnValue(false);

      const actual = await client.readSelectedRows(tableName, selector);

      expect(QE.isQueryExpression).toHaveBeenCalledWith(selector);
      expect(QE.serializeQueryExpression).not.toHaveBeenCalled();
      expect(QE.isQueryStringValid).toHaveBeenCalledWith(selector);
      expect(httpClient.request).toHaveBeenCalledWith(
        expectedUrl,
        key,
        {
          Properties: {
            ...properties,
            Selector: selector,
          },
          Action: 'Find',
          Rows: [],
        } as RequestBody,
      );
      expect(actual).toBe(response);
    });

    it('should call request with Find action when selector is a Query Expression', async () => {
      const queryExpression = 'query-expression' as unknown as QueryExpression;
      const selector = 'selector';
      mocked(QE.isQueryExpression).mockReturnValue(true);
      mocked(QE.serializeQueryExpression).mockReturnValue(selector);


      const actual = await client.readSelectedRows(tableName, queryExpression);

      expect(QE.isQueryExpression).toHaveBeenCalledWith(queryExpression);
      expect(QE.serializeQueryExpression).toHaveBeenCalledWith(queryExpression);
      expect(QE.isQueryStringValid).toHaveBeenCalledWith(selector);
      expect(httpClient.request).toHaveBeenCalledWith(
        expectedUrl,
        key,
        {
          Properties: {
            ...properties,
            Selector: selector,
          },
          Action: 'Find',
          Rows: [],
        } as RequestBody,
      );
      expect(actual).toBe(response);
    });

    it('should throw Error when selector string is not valid', async () => {
      const selector = 'selector';
      mocked(QE.isQueryExpression).mockReturnValue(false);
      mocked(QE.isQueryStringValid).mockReturnValue(false);

      const executor = client.readSelectedRows(tableName, selector);

      await expect(executor).rejects.toThrow(Error);
      expect(httpClient.request).not.toHaveBeenCalled();
    });
  });

  describe('update()', () => {
    it('should call request with Update action', async () => {
      const actual = await client.update(tableName, rows);

      expect(httpClient.request).toHaveBeenCalledWith(
        expectedUrl,
        key,
        {
          Properties: {
            ...properties,
          },
          Action: 'Edit',
          Rows: rows,
        } as RequestBody,
      );
      expect(actual).toBe(response);
    });
  });
});
