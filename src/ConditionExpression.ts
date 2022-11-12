export interface AndExpression {
  type: 'And';
  conditions: ConditionExpression[];
}

export interface OrExpression {
  type: 'Or';
  conditions: ConditionExpression[];
}

export interface NotExpression {
  type: 'Not';
  condition: ConditionExpression;
}

export type ConditionExpression = string | AndExpression | OrExpression | NotExpression;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isConditionExpression(arg: any): arg is ConditionExpression {
  if (typeof arg === 'string') {
    return true;
  }

  if (arg && typeof arg === 'object') {
    switch (arg.type) {
      case 'Not':
        return isConditionExpression(arg.condition);
      case 'And':
      case 'Or':
        if (Array.isArray(arg.conditions)) {
          for (const condition of arg.conditions) {
            if (!isConditionExpression(condition)) {
              return false;
            }
          }

          return true;
        }

        return false;
      default:
        return false;
    }
  }

  return false;
}

export function serializeConditionExpression(condition: ConditionExpression): string {
  if (typeof condition === 'string') {
    return condition;
  }

  switch (condition.type) {
    case 'Not':
      return `NOT(${
        serializeConditionExpression(condition.condition)
      })`;
    case 'And':
    case 'Or':
      if (condition.conditions.length === 1) {
        return serializeConditionExpression(condition.conditions[0]);
      }

      return `${
        condition.type.toUpperCase()
      }(${
        condition.conditions.map((condition) => serializeConditionExpression(condition)).join(', ')
      })`;
  }
}
