import { LayerAppearanceTypes } from "@reearth/core";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";

import { appearanceNodes, appearanceTypes } from "./appearanceNodes";
import { styleConditionOperators } from "./StyleNode/ConditionsTab";
import {
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
          const { valueType, value, expression, conditions } = parseStyleValue(
            nodeRef?.field,
            v as StyleValue
          );
          return {
            id: k,
            type: cur,
            title: nodeRef?.title ?? k,
            field: nodeRef?.field,
            valueType,
            value,
            expression,
            conditions,
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
        : undefined
  };
};

export const convertToLayerStyleValue = (
  styleNodes: StyleNodes
): Partial<LayerAppearanceTypes> => {
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
  }, {});
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

  return conditions
    .map(([condition, applyValue]) => {
      if (condition.startsWith("startsWith(")) {
        const match = condition.match(/^startsWith\((.+),\s*(.+)\)$/);
        if (match) {
          return {
            variable: match[1].trim(),
            operator: "startsWith" as StyleConditionOperator,
            value: match[2].trim(),
            applyValue: unwrapConditionAppliedValue(field, applyValue)
          };
        }
      }

      const match = condition.match(operatorRegex);

      if (match) {
        const operator = match[0] as StyleConditionOperator;
        const [variable, value] = condition
          .split(operator)
          .map((part) => part.trim());

        return {
          variable,
          operator,
          value,
          applyValue: unwrapConditionAppliedValue(field, applyValue)
        };
      }
      return null;
    })
    .filter((c) => c !== null);
};

export const generateConditions = (
  field: AppearanceField,
  conditions?: StyleCondition[]
): [string, string][] => {
  if (!conditions) return [];
  return conditions.map((c) => {
    let conditionExpression: string;
    if (c.operator === "startsWith") {
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
