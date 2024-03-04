import { cloneDeep } from "lodash-es";

import { ExpressionContainer, Feature, LayerSimple } from "../../types";

import { ConditionalExpression } from "./conditionalExpression";
import { Expression } from "./expression";
import { recursiveJSONParse } from "./utils";

export type ExpressionEvalParams = {
  expression: unknown;
  layer: LayerSimple;
  feature?: Feature;
};

export function evalExpression(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expressionContainer: any,
  layer: LayerSimple,
  feature?: Feature,
): unknown | undefined {
  try {
    if (hasExpression(expressionContainer)) {
      const styleExpression = expressionContainer.expression;
      const parsedFeature = recursiveJSONParse(cloneDeep(feature));
      if (typeof styleExpression === "undefined") {
        return undefined;
      } else if (typeof styleExpression === "object" && styleExpression.conditions) {
        return new ConditionalExpression(styleExpression, parsedFeature, layer.defines).evaluate();
      } else if (typeof styleExpression === "boolean" || typeof styleExpression === "number") {
        return new Expression(String(styleExpression), parsedFeature, layer.defines).evaluate();
      } else if (typeof styleExpression === "string") {
        return new Expression(styleExpression, parsedFeature, layer.defines).evaluate();
      }
      return styleExpression;
    }
    return expressionContainer;
  } catch (e) {
    console.error(e);
    return;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasExpression(e: any): e is ExpressionContainer {
  return typeof e === "object" && e && "expression" in e;
}
