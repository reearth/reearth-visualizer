import { pick } from "lodash-es";

import type { EvalContext, EvalResult } from "..";
import {
  appearanceKeys,
  AppearanceTypes,
  ComputedFeature,
  Feature,
  LayerAppearanceTypes,
  LayerSimple,
  ExpressionContainer,
} from "../../types";
import { defined } from "../../utils";

import { ConditionalExpression } from "./conditionalExpression";
import { Expression } from "./expression";

export async function evalSimpleLayer(
  layer: LayerSimple,
  ctx: EvalContext,
): Promise<EvalResult | undefined> {
  const features = layer.data ? await ctx.getAllFeatures(layer.data) : undefined;
  const appearances: Partial<LayerAppearanceTypes> = pick(layer, appearanceKeys);
  return {
    layer: evalLayerAppearances(appearances, layer),
    features: features?.map(f => ({ ...f, ...evalLayerAppearances(appearances, layer, f) })),
  };
}

export const evalSimpleFeature = (layer: LayerSimple, feature: Feature): ComputedFeature => {
  const appearances: Partial<LayerAppearanceTypes> = pick(layer, appearanceKeys);
  return { ...feature, ...evalLayerAppearances(appearances, layer, feature) };
};

export function evalLayerAppearances(
  appearance: Partial<LayerAppearanceTypes>,
  layer: LayerSimple,
  feature?: Feature,
): Partial<AppearanceTypes> {
  return Object.fromEntries(
    Object.entries(appearance).map(([k, v]) => [
      k,
      Object.fromEntries(
        Object.entries(v).map(([k, v]) => {
          return [k, evalExpression(v, layer, feature)];
        }),
      ),
    ]),
  );
}

function hasExpression(e: any): e is ExpressionContainer {
  return typeof e === "object" && e && "expression" in e;
}

function evalExpression(expressionContainer: any, layer: LayerSimple, feature?: Feature): unknown {
  if (hasExpression(expressionContainer)) {
    const styleExpression = expressionContainer.expression;
    if (!defined(styleExpression)) {
      return undefined;
    } else if (typeof styleExpression === "object" && styleExpression.conditions) {
      return new ConditionalExpression(styleExpression, feature, layer.defines).evaluate();
    } else if (typeof styleExpression === "boolean" || typeof styleExpression === "number") {
      return new Expression(String(styleExpression), feature, layer.defines).evaluate();
    } else if (typeof styleExpression === "string") {
      return new Expression(styleExpression, feature, layer.defines).evaluate();
    }
    return styleExpression;
  }
  return expressionContainer;
}
