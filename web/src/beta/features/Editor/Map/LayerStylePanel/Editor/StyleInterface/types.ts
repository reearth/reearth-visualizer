export type AppearanceType =
  | "marker"
  | "polyline"
  | "polygon"
  | "3dtiles"
  | "model";

export type AppearanceField =
  | "switch"
  | "color"
  | "number"
  | "select"
  | "text"
  | "typography"
  | "image"
  | "model";

export type AppearanceNodes = Record<AppearanceType, AppearanceNode[]>;

export type AppearanceNode = {
  id: string;
  title: string;
  field: AppearanceField;
  defaultValue: StyleValue;
  valueOptions?: string[];
  disableExpression?: boolean;
  disableConditions?: boolean;
};

export type StyleNodes = Record<AppearanceType, StyleNode[]>;

export type StyleNode = {
  id: string;
  type: AppearanceType;
  title: string;
  field: AppearanceField;
  valueType: StyleValueType;
  value: StyleValue;
  expression?: string;
  conditions?: StyleCondition[];
  notSupported?: boolean;
  disableExpression?: boolean;
  disableConditions?: boolean;
};

export type StyleValueType =
  | "value"
  | "expression"
  | "conditions"
  | "deepExpression" // not supported yet
  | "deepConditions"; // not supported yet

export type StyleSimpleValue =
  | string
  | number
  | boolean
  | undefined
  | Typography;

export type FontWeight =
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900";

export type Typography = {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: FontWeight;
  color?: string;
  italic?: boolean;
};

export type Expression = {
  expression: string;
};

export type ExpressionCondition = {
  expression: { conditions: [string, string][] };
};
export type StyleValue = StyleSimpleValue | Expression | ExpressionCondition;

export type StyleConditionOperator =
  | "==="
  | "!=="
  | "<"
  | "<="
  | ">"
  | ">="
  | "startsWith";

export type StyleCondition = {
  variable: string;
  operator: StyleConditionOperator;
  value: string;
  applyValue: StyleSimpleValue | undefined;
};
