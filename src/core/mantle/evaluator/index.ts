import { AppearanceTypes, ComputedFeature, Data, DataRange, Feature, LayerSimple } from "../types";

import { evalSimpleLayer } from "./simple";

export type EvalContext = {
  getFeatures: (d: Data, r?: DataRange) => Promise<Feature[] | undefined>;
  getAllFeatures: (d: Data) => Promise<Feature[] | undefined>;
};

export type EvalResult = {
  features?: ComputedFeature[];
  layer: Partial<AppearanceTypes>;
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
