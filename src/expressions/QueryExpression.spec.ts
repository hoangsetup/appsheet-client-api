import {
  isQueryExpression,
  isQueryStringValid,
  QueryExpression,
  serializeQueryExpression,
} from './QueryExpression';
import * as CE from './ConditionExpression';
import mocked = jest.mocked;
import { ConditionExpression } from './ConditionExpression';
describe('QueryExpression', () => {
  describe('isQueryExpression()', () => {
    it('should detect query expression object', () => {
      ([
        [{ type: 'Select' }, true],
        [{ type: 'Filter' }, true],
        [{ type: 'OrderBy' }, true],
        [{ type: 'other' }, false],
      ]as Array<[QueryExpression, boolean]>).forEach(([input, expectation]) => {
        expect(isQueryExpression(input)).toEqual(expectation);
      })
    });
  });

  describe('serializeQueryExpression()', () => {
    beforeEach(() => {
      jest.spyOn(CE, 'isConditionExpression')
        .mockName('isConditionExpression()');
      jest.spyOn(CE, 'serializeConditionExpression')
        .mockName('serializeConditionExpression()');
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should serialize select query when selectRow is a string', () => {
      const query: QueryExpression = {
        type: 'Select',
        fromDatasetColumn: 'table[col]',
        selectRow: 'ISBLANK([ID])',
        distinctOnly: 'TRUE',
      };
      mocked(CE.isConditionExpression).mockReturnValue(false);

      const actual = serializeQueryExpression(query);

      expect(CE.isConditionExpression).toHaveBeenCalledWith(query.selectRow);
      expect(CE.serializeConditionExpression).not.toHaveBeenCalled();
      expect(actual).toEqual('SELECT(table[col], ISBLANK([ID]), TRUE)');
    });

    it('should serialize select query when selectRow is a ConditionExpression', () => {
      const serializedCondition = 'serialized-condition';
      const query: QueryExpression = {
        type: 'Select',
        fromDatasetColumn: 'table[col]',
        selectRow: 'condition-expression' as unknown as ConditionExpression,
        distinctOnly: 'TRUE',
      };
      mocked(CE.isConditionExpression).mockReturnValue(true);
      mocked(CE.serializeConditionExpression).mockReturnValue(serializedCondition);

      const actual = serializeQueryExpression(query);

      expect(CE.isConditionExpression).toHaveBeenCalledWith(query.selectRow);
      expect(CE.serializeConditionExpression).toHaveBeenCalledWith(query.selectRow);
      expect(actual).toEqual(`SELECT(table[col], ${serializedCondition}, TRUE)`);
    });

    it('should serialize filter query when selectRow is a string', () => {
      const query: QueryExpression = {
        type: 'Filter',
        dataset: 'table',
        selectRow: 'ISBLANK([ID])',
      };
      mocked(CE.isConditionExpression).mockReturnValue(false);

      const actual = serializeQueryExpression(query);

      expect(CE.isConditionExpression).toHaveBeenCalledWith(query.selectRow);
      expect(CE.serializeConditionExpression).not.toHaveBeenCalled();
      expect(actual).toEqual('FILTER(table, ISBLANK([ID]))');
    });

    it('should serialize filter query when selectRow is a ConditionExpression', () => {
      const serializedCondition = 'serialized-condition';
      const query: QueryExpression = {
        type: 'Filter',
        dataset: 'table',
        selectRow: 'condition-expression' as unknown as ConditionExpression,
      };
      mocked(CE.isConditionExpression).mockReturnValue(true);
      mocked(CE.serializeConditionExpression).mockReturnValue(serializedCondition);

      const actual = serializeQueryExpression(query);

      expect(CE.isConditionExpression).toHaveBeenCalledWith(query.selectRow);
      expect(CE.serializeConditionExpression).toHaveBeenCalledWith(query.selectRow);
      expect(actual).toEqual(`FILTER(table, ${serializedCondition})`);
    });

    it('should serialize order by query', () => {
      const query: QueryExpression = {
        type: 'OrderBy',
        keys: 'table[col]',
        orderBy: [['[col1]', 'TRUE'], ['[col2]', 'FALSE']],
      };

      const actual = serializeQueryExpression(query);

      expect(actual).toEqual('ORDERBY(table[col], [col1], TRUE, [col2], FALSE)');
    });
  });

  describe('isQueryStringValid()', () => {
    it('should validate query string', () => {
      ([
        ['()', true],
        ['{}', true],
        ['[]', true],
        ['({[]})', true],
        ['({[string]})', true],
        ['ORDERBY(Products[Product ID], [Product Price], TRUE, [Product Name])', true],
        ['({[string]}', false],
        ['({[string]}]', false],
        ['({[]}]', false],
      ] as Array<[string, boolean]>).forEach(([query, expectation]) => {
        expect(isQueryStringValid(query)).toEqual(expectation);
      });
    });
  });
});
