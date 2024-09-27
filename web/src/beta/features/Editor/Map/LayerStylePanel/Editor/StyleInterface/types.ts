export type AppearanceType =
  | "marker"
  | "polyline"
  | "polygon"
  | "3dtiles"
  | "model";

export type AppearanceField = "switch" | "color" | "number" | "select" | "text";

export type AppearaceNodes = Record<AppearanceType, AppearanceNode[]>;

export type AppearanceNode = {
  id: string;
  title: string;
  field: AppearanceField;
  defaultValue: StyleValue;
  valueOptions?: string[];
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
};

export type StyleValueType = "value" | "expression" | "conditions";
export type StyleSimpleValue = string | number | boolean | undefined;
export type StyleValue =
  | StyleSimpleValue
  | number[]
  | {
      expression: { conditions: [string, string][] } | string;
    };

export type StyleCondistionOperator =
  | "==="
  | "!=="
  | "<"
  | "<="
  | ">"
  | ">="
  | "startsWith";

export type StyleCondition = {
  variable: string;
  operator: StyleCondistionOperator;
  value: string;
  applyValue: StyleSimpleValue | undefined;
};
