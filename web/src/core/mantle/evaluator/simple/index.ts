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
  TimeInterval,
} from "../../types";

import { ConditionalExpression } from "./conditionalExpression";
import { clearExpressionCaches, Expression } from "./expression";
import { evalTimeInterval } from "./interval";

export async function evalSimpleLayer(
  layer: LayerSimple,
  ctx: EvalContext,
): Promise<EvalResult | undefined> {
  const features = layer.data ? await ctx.getAllFeatures(layer.data) : undefined;
  const appearances: Partial<LayerAppearanceTypes> = pick(layer, appearanceKeys);
  const timeIntervals = evalTimeInterval(features, layer.data?.time);
  return {
    layer: evalLayerAppearances(appearances, layer),
    features: features?.map((f, i) => evalSimpleLayerFeature(layer, f, timeIntervals?.[i])),
  };
}

export const evalSimpleLayerFeature = (
  layer: LayerSimple,
  feature: Feature,
  interval?: TimeInterval,
): ComputedFeature => {
  const appearances: Partial<LayerAppearanceTypes> = pick(layer, appearanceKeys);
  const nextFeature = evalJsonProperties(layer, feature);
  return {
    ...nextFeature,
    ...evalLayerAppearances(appearances, layer, nextFeature),
    type: "computedFeature",
    interval,
  };
};

export function evalLayerAppearances(
  appearance: Partial<LayerAppearanceTypes>,
  layer: LayerSimple,
  feature?: Feature,
): Partial<AppearanceTypes> {
  if (!feature) {
    if (!layer.id) {
      throw new Error("layer id is required");
    }
    feature = {
      type: "feature",
      id: layer.id,
      properties: layer.properties || {},
    };
  }
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

export function clearAllExpressionCaches(
  layer: LayerSimple | undefined,
  feature: Feature | undefined,
) {
  const appearances: Partial<LayerAppearanceTypes> = pick(layer, appearanceKeys);

  Object.entries(appearances).forEach(([, v]) => {
    Object.entries(v).forEach(([, expressionContainer]) => {
      if (hasExpression(expressionContainer)) {
        const styleExpression = expressionContainer.expression;
        if (typeof styleExpression === "object" && styleExpression.conditions) {
          styleExpression.conditions.forEach(([expression1, expression2]) => {
            clearExpressionCaches(expression1, feature, layer?.defines);
            clearExpressionCaches(expression2, feature, layer?.defines);
          });
        } else if (typeof styleExpression === "boolean" || typeof styleExpression === "number") {
          clearExpressionCaches(String(styleExpression), feature, layer?.defines);
        } else if (typeof styleExpression === "string") {
          clearExpressionCaches(styleExpression, feature, layer?.defines);
        }
      }
    });
  });
}

function hasExpression(e: any): e is ExpressionContainer {
  return typeof e === "object" && e && "expression" in e;
}

function evalExpression(
  expressionContainer: any,
  layer: LayerSimple,
  feature?: Feature,
): unknown | undefined {
  try {
    if (hasExpression(expressionContainer)) {
      const styleExpression = expressionContainer.expression;
      if (typeof styleExpression === "undefined") {
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
  } catch (e) {
    console.error(e);
    return;
  }
}

function evalJsonProperties(layer: LayerSimple, feature: Feature): Feature {
  const keys = layer.data?.jsonProperties;
  if (!feature.properties || !keys || !keys.length) {
    return feature;
  }

  const next = {
    ...feature,
    ...(feature?.properties ? { properties: { ...feature.properties } } : {}),
  };
  keys.forEach(k => {
    next.properties[k] = (() => {
      const p = next.properties[k];
      try {
        return JSON.parse(p);
      } catch {
        return p;
      }
    })();
  });

  return next;
}
