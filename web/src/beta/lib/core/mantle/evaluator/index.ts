import { Transfer } from "threads";

import {
  AppearanceTypes,
  ComputedFeature,
  Data,
  DataRange,
  Feature,
  Layer,
  LayerSimple,
} from "../types";

import { queue } from "./workerPool";

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
    let result;
    queue(async task => {
      result = await task.evaluateSimple(
        Transfer(
          {
            layer,
            ctx,
          },
          [],
        ),
      );
    });

    return result;
  }
  return;
}

export function evalFeature(layer: Layer, feature: Feature): ComputedFeature | undefined {
  if (layer.type === "simple") {
    let result: ComputedFeature | undefined;
    queue(async task => {
      result = await task.evaluateSimpleLayerFeature(
        Transfer(
          {
            layer,
            feature,
          },
          [],
        ),
      );
    });
    return result;
  }
  return undefined;
}
