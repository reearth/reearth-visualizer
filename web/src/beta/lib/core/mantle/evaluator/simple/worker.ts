import { Feature, LayerSimple } from "../../types";

import { evalExpression } from "./evalExpression";

export type ExpressionEvalParams = {
  expression: unknown;
  layer: LayerSimple;
  feature?: Feature;
};

export type ExpressionWorker = object & {
  evaluateExpression: (params: ExpressionEvalParams) => Promise<unknown>;
};

self.addEventListener("message", async event => {
  const { expression, layer, feature }: ExpressionEvalParams = event.data;

  try {
    const result = await evalExpression(expression, layer, feature);
    (self as any).postMessage(result);
  } catch (error) {
    (self as any).postMessage({ error: (error as Error).message });
  }
});
