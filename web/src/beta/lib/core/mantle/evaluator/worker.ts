import { type TransferDescriptor } from "threads";
import { expose } from "threads/worker";

import { ComputedFeature, Feature, LayerSimple, TimeInterval } from "../types";

import { evalSimpleLayer, evalSimpleLayerFeature } from "./simple";

import { EvalContext, EvalResult } from ".";

export type EvalSimpleParams = {
  layer: LayerSimple;
  ctx: EvalContext;
};

export type EvalSimpleLayerFeatureParams = {
  layer: LayerSimple;
  feature: Feature;
  interval?: TimeInterval;
};

const evaluateSimple = async ({
  layer,
  ctx,
}: EvalSimpleParams): Promise<EvalResult | undefined> => {
  return await evalSimpleLayer(layer, ctx);
};

const evaluateSimpleLayerFeature = ({
  layer,
  feature,
  interval,
}: EvalSimpleLayerFeatureParams): ComputedFeature => {
  return evalSimpleLayerFeature(layer, feature, interval);
};

expose({
  evaluateSimple,
  evaluateSimpleLayerFeature,
});

export type ExpressionWorker = object & {
  evaluateSimple: (params: TransferDescriptor<EvalSimpleParams>) => Promise<EvalResult | undefined>;
  evaluateSimpleLayerFeature: (
    params: TransferDescriptor<EvalSimpleLayerFeatureParams>,
  ) => ComputedFeature;
};
