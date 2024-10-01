import { LayerAppearanceTypes } from "@reearth/core";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";

import { appearanceNodes, appearanceTypes } from "./appearanceNodes";
import { styleConditionOperators } from "./StyleNode/ConditionsTab";
import {
  StyleConditionOperator,
  StyleCondition,
  StyleNode,
  StyleNodes,
  StyleValue
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
            notSupported: !nodeRef
          };
        })
        .filter((n) => n !== null)
    };
  }, {} as StyleNodes);
};

export const parseStyleValue = (v: StyleValue) => {
  if (typeof v === "object") {
    if ("expression" in v) {
      if (typeof v.expression === "object" && "conditions" in v.expression) {
        return {
          valueType: "conditions",
          value: undefined,
          expression: undefined,
          conditions: parseConditions(v.expression.conditions)
        };
      }
      return {
        valueType: "expression",
        value: undefined,
        expression: v.expression,
        conditions: undefined
      };
    }
  }
  return {
    valueType: "value",
    value: v,
    expression: undefined,
    conditions: undefined
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
