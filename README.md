# AppSheetApiClient

A Node.js wrapper for [Google AppSheet API](https://support.google.com/appsheet/answer/10105768)

## Enable API

1. Open the app in the app editor.
2. Select `Settings` > `Integrations`.
3. Under `IN: from cloud services to your app`, enable the `Enable` toggle.
4. This enables the API for the application as a whole.
5. Ensure that at least one unexpired `Application Access Key` is present.
6. Otherwise, click `Create Application Access` Key.

Referent document: [AppSheet Help Center](https://support.google.com/appsheet/answer/10105769)

## Features

- Simplified AppSheet API usage
- Easy to build query string by Condition Expression and Query Expression

## Installation

With npm:

```shell
npm install appsheet-client-api
```

With yarn:

```shell
yarn add appsheet-client-api
```

## Getting started

First, you need create a AppSheet API Client instance.

```ts
const client = new AppSheetApiClient(appSheetAppId, appSheetKey, properties);
```

### Add records to a table

**add\<T>(tableName: string, rows: T[]) => Promise<T[]>**

Example:

```ts
const accounts: IAccount[] = [
  { email: 'foo@example.com', name: 'Foo' },
];

const createdRows = await client.add<IAccount>('Accounts', accounts);
//    ^? const createdRows: IAccount[]
```

### Delete records from a table

**delete\<T>(tableName: string, rows: T[]) => Promise<T[]>**

Example:

```ts
const accounts: IAccount[] = [
  { email: 'foo@example.com', name: 'Foo' },
];

const deletedRows = await client.delete<IAccount>('Accounts', accounts);
//    ^? const deletedRows: IAccount[]
```

### Update records in a table

**update\<T>(tableName: string, rows: T[]) => Promise<T[]>**

Example:

```ts
const accounts: IAccount[] = [
  { email: 'foo@example.com', name: 'Foo' },
];

const updatedRows = await client.update<IAccount>('Accounts', accounts);
//    ^? const updatedRows: IAccount[]
```

### Read records from a table

Read existing records in a table using the API.

#### **readAllRows\<T>(tableName: string) => Promise<T[]>**

This function will return all rows in the table.

Example:

```ts
const accounts = await client.readAllRows<IAccount>('Accounts');
//    ^? const accounts: IAccount[]
```

#### **readByKeys\<T>(tableName: string, keys: T[]) => Promise<T[]>**

This will return all rows having matching key values from the table.

Example:

```ts
const accounts = await client.readByKeys<IAccount>('Accounts', [{ ID: '0001'}]);
//    ^? const accounts: IAccount[]
```

#### **readSelectedRows\<T>(tableName: string, selector: string | QueryExpression) => Promise<T[]>**

In this function, you can specify an expression to select and format the rows returned.

Example: You want to filter data on `Pepple` table by following Selector `Select(People[_ComputedKey], And([Age] >= 21, [State] = "CA"), true)`

- Option 1: You can define selector as a string

```ts
const result = await client.readSelectedRows<IPeople>(
//    ^? const result: IPeople[]
  'People',
  'Select(People[_ComputedKey], And([Age] >= 21, [State] = "CA"), TRUE)',
);
```

- Option 2: Use Select Query Expression object

```ts
const selector: QueryExpression = {
  type: 'Select',
  fromDatasetColumn: 'People[_ComputedKey]',
  selectRow: 'And([Age] >= 21, [State] = "CA")',
  distinctOnly: 'TRUE',
};

const result = await client.readSelectedRows<IPeople>(
//    ^? const result: IPeople[]
  'People',
  selector,
);
```

- Option 3: Use Select Query Expression object and Condition Expression

```ts
const condition: ConditionExpression = {
  type: 'And',
  conditions: [
    '[Age] >= 21',
    '[State] = "CA"',
  ],
};

const selector: QueryExpression = {
  type: 'Select',
  fromDatasetColumn: 'People[_ComputedKey]',
  selectRow: condition,
  distinctOnly: 'TRUE',
};

const result = await client.readSelectedRows<IPeople>(
//    ^? const result: IPeople[]
  'People',
  selector,
);
```

Supported operations

## Supported expression

### Condition expressions

- **AndExpression**

```ts
export interface AndExpression {
  type: 'And';
  conditions: ConditionExpression[];
}
```

A comparison expression asserting that all conditions in the provided list are true.

Example:

```ts
const condition: ConditionExpression = {
  type: 'And',
  conditions: [
    '[Age] >= 21',
    '[Age] <= 30',
    '[State] = "CA"',
    '[City] = "Newport Beach"',
  ],
};
// => AND([Age] >= 21, [Age] <= 30, [State] = "CA", [City] = "Newport Beach")
```

- **OrExpression**

```ts
export interface OrExpression {
  type: 'Or';
  conditions: ConditionExpression[];
}
```

A comparison expression asserting that one or more conditions in the provided list are true.

Example:

```ts
const condition: ConditionExpression = {
  type: 'Or',
  conditions: [
    '[Age] >= 21',
    '[State] = "CA"',
  ],
};
// => OR([Age] >= 21, [State] = "CA")
```

- **NotExpression**

```ts
export interface NotExpression {
  type: 'Not';
  condition: ConditionExpression;
}
```

A comparison expression asserting that the provided condition is not true.

Example:

```ts
  const condition: ConditionExpression = {
  type: 'Not',
  condition: 'IN([City]), {"Newport Beach", "San Jose"}',
};
// => NOT(IN([City]), {"Newport Beach", "San Jose"})
```

---

You can combine one or more condition expression.

```ts
const condition: ConditionExpression = {
  type: 'And',
  conditions: [
    '[Age] >= 21',
    {
      type: 'Or',
      conditions: [
        {
          type: 'Not',
          condition: 'IN([City]), {"Newport Beach", "San Jose"}',
        },
        'ISBLANK([Fax])',
      ],
    },
  ],
};
// => AND([Age] >= 21, OR(NOT(IN([City]), {"Newport Beach", "San Jose"}), ISBLANK([Fax])))
```

### Query expressions

```ts
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

export type SelectExpression = {
  type: 'Select';
  fromDatasetColumn: string;
  selectRow: string | ConditionExpression;
  distinctOnly: 'TRUE' | 'FALSE';
}
```

These interfaces are mapping to AppSheet functions:

- [FILTER()](https://support.google.com/appsheet/answer/10108196) to return keys to rows in a table or slice.
- [ORDERBY()](https://support.google.com/appsheet/answer/10107362) expression to control the sort order of the returned records.
- [SELECT()](https://support.google.com/appsheet/answer/10108207) expression that yields a list of record key values. The records identified by the key values are returned in the Rows response. The SELECT() expression can refer to a slice.
