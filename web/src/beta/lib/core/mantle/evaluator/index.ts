import {
  AppearanceTypes,
  ComputedFeature,
  Data,
  DataRange,
  Feature,
  Layer,
  LayerSimple,
} from "../types";

import { evalSimpleLayerFeature, evalSimpleLayer } from "./simple";

export { clearAllExpressionCaches } from "./simple";

export type EvalContext = {
  getFeatures: (d: Data, r?: DataRange) => Promise<Feature[] | undefined>;
  getAllFeatures: (d: Data) => Promise<Feature[] | undefined>;
};

export type EvalResult = {
  features?: ComputedFeature[];
  layer?: Partial<AppearanceTypes>;
};

export async function evalLayer(
  layer: LayerSimple,
  ctx: EvalContext,
): Promise<EvalResult | undefined> {
  if (layer.type === "simple") {
    return evalSimpleLayer(layer, ctx);
  }
  return;
}

export async function evalFeature(
  layer: Layer,
  feature: Feature,
): Promise<ComputedFeature | undefined> {
  if (layer.type === "simple") {
    return await evalSimpleLayerFeature(layer, feature);
  }
  return;
}
