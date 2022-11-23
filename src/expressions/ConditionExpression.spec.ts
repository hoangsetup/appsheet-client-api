import {
  ConditionExpression, isConditionExpression,
  serializeConditionExpression,
} from './ConditionExpression';

describe('ConditionExpression', () => {
  describe('serializeConditionExpression()', () => {
    it('should serialize negation expressions', () => {
      const expression: ConditionExpression = {
        type: 'Not',
        condition: 'ISBLANK([Name])',
      };
      const serialized = serializeConditionExpression(expression);

      expect(serialized).toBe('NOT(ISBLANK([Name]))');
    });

    it('should serialize and/or expressions', () => {
      ([
        [
          {
            type: 'And',
            conditions: [
              'C1',
              'C2',
              {
                type: 'Or',
                conditions: [
                  'C3',
                  'C4',
                ]
              },
            ],
          },
          'AND(C1, C2, OR(C3, C4))',
        ],
        [
          {
            type: 'Or',
            conditions: [
              'C1'
            ],
          },
          'C1',
        ],
      ] as Array<[ConditionExpression, string]>).forEach(([condition, expectation]) => {
        expect(serializeConditionExpression(condition)).toEqual(expectation);
      });
    });
  });

  describe('isConditionExpression()', () => {
    it('should return true for valid expressions', () => {
      ([
        'C1',
        { type: 'And', conditions: ['C1'] },
        { type: 'Or', conditions: ['C1'] },
        { type: 'Not', condition: 'C1' },
      ]).forEach((arg) => {
        expect(isConditionExpression(arg)).toBe(true);
      })
    });

    it('should return false for invalid expressions', () => {
      ([
        null,
        [],
        { type: 'ADN', conditions: ['C1'] },
        { type: 'And', conditions: [null] },
        { type: 'And', conditions: [{ type: 'ADN' }] },
        { type: 'And', conditions: '' },
        { type: 'Or', conditions: [null] },
        { type: 'Or', conditions: [{ type: 'ADN' }] },
        { type: 'Not', condition: null },
      ]).forEach((arg) => {
        expect(isConditionExpression(arg)).toBe(false);
      })
    });
  });
});
