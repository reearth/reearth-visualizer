import { pick } from "lodash-es";

import type { EvalContext, EvalResult } from "..";
import {
  appearanceKeys,
  AppearanceTypes,
  Expression,
  Feature,
  LayerAppearanceTypes,
  LayerSimple,
} from "../../types";

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
          if (typeof v === "object" && "conditions" in v) {
            return [k, evalExpression(v, layer, feature)];
          }
          return [k, v];
        }),
      ),
    ]),
  );
}

function evalExpression(_e: Expression, _layer: LayerSimple, _feature?: Feature): unknown {
  // TODO: eval
  return undefined;
}
