import { LayerAppearanceTypes } from "@reearth/core";
import type { LayerStyle } from "@reearth/services/api/layerStyle";

import { appearanceNodes, appearanceTypes } from "./appearanceNodes";
import { styleConditionOperators } from "./StyleNode/ConditionsTab";
import {
  AppearanceType,
  StyleConditionOperator,
  StyleCondition,
  StyleNode,
  StyleNodes,
  StyleValue,
  ExpressionCondition,
  Expression,
  StyleValueType,
  AppearanceField
} from "./types";

export const convertToStyleNodes = (
  layerStyle: LayerStyle | undefined
): StyleNodes => {
  return appearanceTypes.reduce((acc, cur) => {
    return {
      ...acc,
      [cur]: Object.entries(layerStyle?.value?.[cur] || {})
        .map(([k, v]: [string, unknown]) => {
          const nodeRef = appearanceNodes[cur].find((n) => n.id === k);
          const { valueType, value, expression, conditions, rawValue } =
            parseStyleValue(nodeRef?.field, v as StyleValue);
          return {
            id: k,
            type: cur,
            title: nodeRef?.title ?? k,
            field: nodeRef?.field,
            valueType,
            value,
            expression,
            conditions,
            rawValue,
            notSupported: !nodeRef,
            disableExpression: nodeRef?.disableExpression,
            disableConditions: nodeRef?.disableConditions
          };
        })
        .filter((n) => n !== null)
    };
  }, {} as StyleNodes);
};

export const checkExpressionAndConditions = (v: unknown): StyleValueType => {
  if (
    typeof v === "string" ||
    typeof v === "number" ||
    typeof v === "boolean"
  ) {
    return "value";
  }

  if (
    typeof v === "object" &&
    v !== null &&
    "expression" in v &&
    typeof v.expression === "string"
  ) {
    return "expression";
  }

  if (
    typeof v === "object" &&
    v !== null &&
    "expression" in v &&
    typeof v.expression === "object" &&
    v.expression !== null &&
    "conditions" in v.expression
  ) {
    return "conditions";
  }

  // only check one level deep
  let hasDeepExpression = false;
  if (typeof v === "object" && v !== null && !("expression" in v)) {
    const obj = v as Record<string, unknown>;
    for (const key in obj) {
      const value = obj[key];
      if (
        typeof value === "object" &&
        value !== null &&
        "expression" in value
      ) {
        hasDeepExpression = true;
        const valueWithExpression = value as { expression: unknown };
        if (
          typeof valueWithExpression.expression === "object" &&
          valueWithExpression.expression !== null &&
          "conditions" in valueWithExpression.expression
        ) {
          return "deepConditions";
        }
      }
    }
  }
  if (hasDeepExpression) return "deepExpression";

  // some unknown type could be included
  return "value";
};

export const parseStyleValue = (
  field: AppearanceField | undefined,
  v: StyleValue
) => {
  const valueType = checkExpressionAndConditions(v);
  return {
    valueType,
    value: valueType === "value" ? v : undefined,
    expression:
      valueType === "expression"
        ? unwrapExpression(field, (v as Expression).expression)
        : undefined,
    conditions:
      valueType === "conditions"
        ? parseConditions(
            field,
            (v as ExpressionCondition).expression.conditions
          )
        : undefined,
    rawValue:
      valueType === "deepExpression" || valueType === "deepConditions"
        ? v
        : undefined
  };
};

// `base` is the style value being edited. Top-level keys the UI doesn't model
// (e.g. `raster`, `resource`, `ellipsoid`) are carried over from it as-is, the
// same way unknown keys inside a known appearance type are kept as
// `notSupported` nodes. Known appearance types are always rebuilt from
// `styleNodes`, so removing every node of a type still removes the type.
export const convertToLayerStyleValue = (
  styleNodes: StyleNodes,
  base?: Partial<LayerAppearanceTypes>
): Partial<LayerAppearanceTypes> => {
  const preserved = Object.fromEntries(
    Object.entries(base ?? {}).filter(
      ([k]) => !appearanceTypes.includes(k as AppearanceType)
    )
  ) as Partial<LayerAppearanceTypes>;

  return appearanceTypes.reduce((acc, cur) => {
    return styleNodes[cur].length > 0
      ? {
          ...acc,
          [cur]: styleNodes[cur].reduce((acc2, cur2) => {
            return {
              ...acc2,
              [cur2.id]: generateStyleValue(cur2)
            };
          }, {})
        }
      : acc;
  }, preserved);
};

export const generateStyleValue = (node: StyleNode) => {
  if (node.valueType === "value") {
    return node.value ?? "";
  }
  if (node.valueType === "expression") {
    return { expression: wrapExpression(node.field, node.expression ?? "") };
  }
  if (node.valueType === "conditions") {
    return {
      expression: {
        conditions: generateConditions(node.field, node.conditions)
      }
    };
  }
  if (
    node.valueType === "deepExpression" ||
    node.valueType === "deepConditions"
  ) {
    return node.rawValue;
  }
  return undefined;
};

export const parseConditions = (
  field: AppearanceField | undefined,
  conditions: [string, string][]
): StyleCondition[] => {
  const operatorRegex = new RegExp(
    `(${styleConditionOperators
      .map((op) => {
        if (op === "startsWith") {
          return "startsWith";
        }
        return op.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      })
      .join("|")})`
  );

  return conditions.map(([condition, applyValue]) => {
    const parsed = parseSimpleCondition(condition, operatorRegex);
    if (parsed) {
      return {
        ...parsed,
        applyValue: unwrapConditionAppliedValue(field, applyValue)
      };
    }
    // Keep anything we can't represent as `variable operator value` verbatim,
    // so rebuilding the style from the UI doesn't drop or corrupt it.
    return {
      variable: "",
      operator: "===" as StyleConditionOperator,
      value: "",
      rawCondition: condition,
      applyValue: unwrapConditionAppliedValue(field, applyValue)
    };
  });
};

// Logical / ternary operators mean the condition is compound and can't be
// split into a single `variable operator value` triple without losing parts.
const COMPOUND_CONDITION_REGEX = /&&|\|\||\?/;

const parseSimpleCondition = (
  condition: string,
  operatorRegex: RegExp
): Omit<StyleCondition, "applyValue"> | null => {
  const toSimple = (
    variable: string,
    operator: StyleConditionOperator,
    value: string
  ) =>
    variable &&
    value &&
    !COMPOUND_CONDITION_REGEX.test(variable) &&
    !COMPOUND_CONDITION_REGEX.test(value)
      ? { variable, operator, value }
      : null;

  if (condition.startsWith("startsWith(")) {
    const match = condition.match(/^startsWith\((.+),\s*(.+)\)$/);
    if (match) {
      return toSimple(match[1].trim(), "startsWith", match[2].trim());
    }
  }

  const match = condition.match(operatorRegex);
  if (!match) return null;

  const operator = match[0] as StyleConditionOperator;
  const parts = condition.split(operator).map((part) => part.trim());
  // More than two parts means the operator appears more than once, e.g. a
  // compound condition; splitting it would silently drop the remainder.
  if (parts.length !== 2) return null;

  return toSimple(parts[0], operator, parts[1]);
};

export const generateConditions = (
  field: AppearanceField,
  conditions?: StyleCondition[]
): [string, string][] => {
  if (!conditions) return [];
  return conditions.map((c) => {
    let conditionExpression: string;
    if (c.rawCondition !== undefined) {
      conditionExpression = c.rawCondition;
    } else if (c.operator === "startsWith") {
      conditionExpression = `startsWith(${c.variable}, ${c.value})`;
    } else {
      conditionExpression = `${c.variable} ${c.operator} ${c.value}`;
    }

    return [
      conditionExpression,
      wrapConditionApplyValue((c.applyValue ?? "").toString(), field)
    ];
  });
};

export const wrapConditionApplyValue = (
  value: string,
  field: AppearanceField
) => {
  switch (field) {
    case "color":
      return wrapColor(value);
    case "image":
    case "text":
    case "model":
      return wrapString(value);
    default:
      return value;
  }
};

export const unwrapConditionAppliedValue = (
  field: AppearanceField | undefined,
  value: string
) => {
  switch (field) {
    case "color":
      return unwrapColor(value);
    case "image":
    case "text":
    case "model":
      return unwrapString(value);
    default:
      return value;
  }
};

export const wrapExpression = (field: AppearanceField, expression: string) => {
  if (/^\${.+}$/.test(expression)) {
    return expression;
  }
  switch (field) {
    case "color":
      return wrapColor(expression);
    case "image":
    case "text":
    case "model":
      return wrapString(expression);
    default:
      return expression;
  }
};

export const unwrapExpression = (
  field: AppearanceField | undefined,
  expression: string
) => {
  if (/^\${.+}$/.test(expression)) {
    return expression;
  }
  switch (field) {
    case "color":
      return unwrapColor(expression);
    case "image":
    case "text":
    case "model":
      return unwrapString(expression);
    default:
      return expression;
  }
};

export const wrapColor = (maybeColor: string) => {
  if (
    /^#(?:[0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(maybeColor)
  ) {
    return `color('${maybeColor}')`;
  }
  return maybeColor;
};

export const unwrapColor = (maybeWrappedColor: string) => {
  if (/^color\('.+'\)$/.test(maybeWrappedColor)) {
    return maybeWrappedColor.slice(7, -2);
  }
  return maybeWrappedColor;
};

export const wrapString = (url: string) => {
  if (!url) return url;
  if (/^'.+'$/.test(url)) {
    return url;
  }
  return `'${url}'`;
};

export const unwrapString = (maybeWrappedString: string) => {
  if (!maybeWrappedString) return maybeWrappedString;
  if (/^'.+'$/.test(maybeWrappedString)) {
    return maybeWrappedString.slice(1, -1);
  }
  return maybeWrappedString;
};
