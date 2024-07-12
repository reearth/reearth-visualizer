export type ExpressionContainer = {
  expression: StyleExpression;
};

export type StyleExpression = ConditionsExpression | string;

export type ConditionsExpression = {
  conditions: [string, string][];
};
