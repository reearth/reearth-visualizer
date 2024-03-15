import { type TransferDescriptor } from "threads";
import { expose } from "threads/worker";

import { Feature, LayerSimple } from "../../types";

import { evalExpression } from "./evalExpression";

export type ExpressionEvalParams = {
  expression: unknown;
  layer: LayerSimple;
  feature?: Feature;
};

const evaluateExpression = async ({
  expression,
  layer,
  feature,
}: ExpressionEvalParams): Promise<unknown> => {
  return await evalExpression(expression, layer, feature);
};

expose({
  evaluateExpression,
});

export type ExpressionWorker = object & {
  evaluateExpression: (params: TransferDescriptor<ExpressionEvalParams>) => Promise<unknown>;
};
