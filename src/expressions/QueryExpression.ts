import { ConditionExpression, isConditionExpression, serializeConditionExpression } from './ConditionExpression';

export type SelectExpression = {
  type: 'Select';
  fromDatasetColumn: string;
  selectRow: string | ConditionExpression;
  distinctOnly: 'TRUE' | 'FALSE';
}

export type FilterExpression = {
  type: 'Filter';
  dataset: string;
  selectRow: string | ConditionExpression;
}

export type OrderByExpression = {
  type: 'OrderBy';
  keys: string;
  orderBy: Array<[string, 'TRUE' | 'FALSE']>;
}

export type QueryExpression = SelectExpression | FilterExpression | OrderByExpression;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isQueryExpression(arg: any): arg is QueryExpression {
  return ['Select', 'Filter', 'OrderBy'].includes(arg.type);
}

export function serializeQueryExpression(query: QueryExpression): string {
  switch (query.type) {
    case 'Select': {
      const select = isConditionExpression(query.selectRow)
        ? serializeConditionExpression(query.selectRow)
        : query.selectRow;
      return `SELECT(${
        query.fromDatasetColumn
      }, ${
        select
      }, ${
        query.distinctOnly
      })`;
    }
    case 'Filter': {
      const filter = isConditionExpression(query.selectRow)
        ? serializeConditionExpression(query.selectRow)
        : query.selectRow;
      return `FILTER(${
        query.dataset
      }, ${
        filter
      })`;
    }
    case 'OrderBy':
      return `ORDERBY(${
        query.keys
      }, ${
        query.orderBy.map((item) => item.join(', ')).join(', ')
      })`;
  }
}

export function isQueryStringValid(input: string): boolean {
  const openCloseMap = new Map([
    ['(', ')'],
    ['{', '}'],
    ['[', ']'],
  ]);
  const openCloseSet = new Set(['(', ')', '{', '}', '[', ']']);

  const stack: string[] = [];

  for (const char of input) {
    if (!openCloseSet.has(char)) {
      continue;
    }

    if (openCloseMap.has(char)) {
      stack.push(char);
    } else if (openCloseMap.get(stack[stack.length - 1]) === char) {
      stack.pop();
    } else {
      return false;
    }
  }

  return stack.length === 0;
}
