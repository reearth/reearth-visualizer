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
): StyleCondition[] =>
  conditions.map(([condition, applyValue]) => {
    const parsed = parseSimpleCondition(condition);
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

// Logical / ternary operators mean the condition is compound and can't be
// split into a single `variable operator value` triple without losing parts.
const COMPOUND_CONDITION_REGEX = /&&|\|\||\?/;

const IDENTIFIER_CHAR_REGEX = /[\w$]/;

// Finds the positions of `tokens` that sit outside string literals,
// parentheses, brackets and `${...}`, so e.g. the `>` in `'>'` or in
// `fn(${a} > 1)` isn't mistaken for the condition's own operator.
// Returns null when quotes or brackets are unbalanced.
const findTopLevelTokens = (
  input: string,
  tokens: readonly string[]
): { token: string; index: number }[] | null => {
  const found: { token: string; index: number }[] = [];
  let quote: string | null = null;
  let depth = 0;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }
    if ("([{".includes(ch)) {
      depth++;
      continue;
    }
    if (")]}".includes(ch)) {
      if (--depth < 0) return null;
      continue;
    }
    if (depth !== 0) continue;

    const token = tokens.find(
      (t) =>
        input.startsWith(t, i) &&
        // Word operators like `startsWith` must not match inside identifiers.
        (!IDENTIFIER_CHAR_REGEX.test(t) ||
          (!IDENTIFIER_CHAR_REGEX.test(input[i - 1] ?? "") &&
            !IDENTIFIER_CHAR_REGEX.test(input[i + t.length] ?? "")))
    );
    if (token) {
      found.push({ token, index: i });
      i += token.length - 1;
    }
  }

  return quote || depth !== 0 ? null : found;
};

const parseSimpleCondition = (
  condition: string
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

  const trimmed = condition.trim();

  const call = trimmed.match(/^startsWith\s*\(([\s\S]*)\)$/);
  if (call) {
    // Unbalanced args (null) mean the closing paren isn't this call's, e.g.
    // `startsWith(${a}, 'x') === startsWith(${b}, 'y')`.
    const args = call[1];
    const commas = findTopLevelTokens(args, [","]);
    if (!commas || commas.length !== 1) return null;
    const { index } = commas[0];
    return toSimple(
      args.slice(0, index).trim(),
      "startsWith",
      args.slice(index + 1).trim()
    );
  }

  const operators = findTopLevelTokens(trimmed, styleConditionOperators);
  // Exactly one top-level operator; more means a compound or otherwise
  // unsupported expression that splitting would corrupt.
  if (!operators || operators.length !== 1) return null;

  const { token, index } = operators[0];
  return toSimple(
    trimmed.slice(0, index).trim(),
    token as StyleConditionOperator,
    trimmed.slice(index + token.length).trim()
  );
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
