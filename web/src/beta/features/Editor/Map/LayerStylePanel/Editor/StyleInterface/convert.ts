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
  StyleValueType
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

export const checkExpressionAndConditions = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  v: any
): StyleValueType => {
  if (
    typeof v === "string" ||
    typeof v === "number" ||
    typeof v === "boolean"
  ) {
    return "value";
  }

  if (
    typeof v === "object" &&
    "expression" in v &&
    typeof v.expression === "string"
  ) {
    return "expression";
  }

  if (
    typeof v === "object" &&
    "expression" in v &&
    typeof v.expression === "object" &&
    "conditions" in v.expression
  ) {
    return "conditions";
  }

  // only check one level deep
  let hasDeepExpression = false;
  if (typeof v === "object" && !("expression" in v)) {
    for (const key in v) {
      if (typeof v[key] === "object" && "expression" in v[key]) {
        hasDeepExpression = true;
        if (
          typeof v[key].expression === "object" &&
          "conditions" in v[key].expression
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

export const parseStyleValue = (v: StyleValue) => {
  const valueType = checkExpressionAndConditions(v);
  return {
    valueType,
    value: valueType === "value" ? v : undefined,
    expression:
      valueType === "expression" ? (v as Expression).expression : undefined,
    conditions:
      valueType === "conditions"
        ? parseConditions((v as ExpressionCondition).expression.conditions)
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
    return { expression: node.expression ?? "" };
  }
  if (node.valueType === "conditions") {
    return { expression: { conditions: generateConditions(node.conditions) } };
  }
  return undefined;
};

export const parseConditions = (
  conditions: [string, string][]
): StyleCondition[] => {
  const operatorRegex = new RegExp(
    `(${styleConditionOperators.map((op) => op.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`
  );

  return conditions
    .map(([condition, applyValue]) => {
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
          applyValue: unwrapColor(applyValue)
        };
      }
      return null;
    })
    .filter((c) => c !== null);
};

export const generateConditions = (
  conditions?: StyleCondition[]
): [string, string][] => {
  if (!conditions) return [];
  return conditions.map((c) => {
    return [
      `${c.variable} ${c.operator} ${c.value}`,
      wrapColor((c.applyValue ?? "").toString())
    ];
  });
};

export const wrapColor = (maybeColor: string) => {
  // check if color is a valid hex string
  if (/^#[0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8}$/i.test(maybeColor)) {
    return `color('${maybeColor}')`;
  }
  return maybeColor;
};

export const unwrapColor = (maybeWrappedColor: string) => {
  // check if color is wrapped with color()
  if (/^color\('.+'\)$/.test(maybeWrappedColor)) {
    return maybeWrappedColor.slice(7, -2);
  }
  return maybeWrappedColor;
};
