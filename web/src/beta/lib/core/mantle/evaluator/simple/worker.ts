import { evalExpression, ExpressionEvalParams } from "./evalExpression";

export type ExpressionWorker = object & {
  evaluateExpression: (params: ExpressionEvalParams) => Promise<unknown>;
};

self.onmessage = async (event: MessageEvent) => {
  const { expression, layer, feature }: ExpressionEvalParams = event.data;

  try {
    const result = await evalExpression(expression, layer, feature);
    (self as any).postMessage(result);
  } catch (error) {
    (self as any).postMessage({ error: (error as Error).message });
  }
};
