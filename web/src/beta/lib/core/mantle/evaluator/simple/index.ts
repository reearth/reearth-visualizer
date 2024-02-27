import { pick } from "lodash-es";
// import { Transfer } from "threads";

import type { EvalContext, EvalResult } from "..";
import {
  appearanceKeys,
  AppearanceTypes,
  ComputedFeature,
  Feature,
  LayerAppearanceTypes,
  LayerSimple,
  TimeInterval,
} from "../../types";

import { evalTimeInterval } from "./interval";
import { ExpressionEvalParams } from "./worker";
import { WorkerQueue } from "./workerPool";

export async function evalSimpleLayer(
  layer: LayerSimple,
  ctx: EvalContext,
): Promise<EvalResult | undefined> {
  const features = layer.data ? await ctx.getAllFeatures(layer.data) : undefined;
  const appearances: Partial<LayerAppearanceTypes> = pick(layer, appearanceKeys);
  const timeIntervals = evalTimeInterval(features, layer.data?.time);

  const evaluatedAppearances = await evalLayerAppearances(appearances, layer);
  const evaluatedFeatures = features
    ? await Promise.all(
        features.map((f, i) => evalSimpleLayerFeature(layer, f, timeIntervals?.[i])),
      )
    : undefined;

  return {
    layer: evaluatedAppearances,
    features: evaluatedFeatures,
  };
}

export const evalSimpleLayerFeature = async (
  layer: LayerSimple,
  feature: Feature,
  interval?: TimeInterval,
): Promise<ComputedFeature> => {
  const appearances: Partial<LayerAppearanceTypes> = pick(layer, appearanceKeys);
  const nextFeature = evalJsonProperties(layer, feature);
  const evaluatedAppearances = await evalLayerAppearances(appearances, layer, nextFeature);
  return {
    ...nextFeature,
    ...evaluatedAppearances,
    type: "computedFeature",
    interval,
  };
};

export async function evalLayerAppearances(
  appearance: Partial<LayerAppearanceTypes>,
  layer: LayerSimple,
  feature?: Feature,
): Promise<Partial<AppearanceTypes>> {
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

  const entries = await Promise.all(
    Object.entries(appearance).map(async ([k, v]) => {
      if (v) {
        const evaluatedValue = await recursiveValEval(v, layer, feature);
        return [k, evaluatedValue];
      }
      return undefined;
    }),
  );

  return Object.fromEntries(entries.filter((entry): entry is [string, any] => entry !== undefined));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function recursiveValEval(obj: any, layer: LayerSimple, feature?: Feature): Promise<any> {
  const entries = await Promise.all(
    Object.entries(obj).map(async ([k, v]) => {
      // if v is an object itself and not a null, recurse deeper
      if (hasNonExpressionObject(v)) {
        return [k, await recursiveValEval(v, layer, feature)];
      }
      // if v is not an object, apply the evalExpression function
      const evaluated = await evaluateWithWorker({
        expression: v,
        layer,
        feature,
      });
      return [k, evaluated];
    }),
  );

  return Object.fromEntries(entries);
}

export function clearAllExpressionCaches(
  layer: LayerSimple | undefined,
  _feature: Feature | undefined,
) {
  const appearances: Partial<LayerAppearanceTypes> = pick(layer, appearanceKeys);
  Object.entries(appearances).forEach(([, _v]) => {
    // recursiveClear(v, layer, feature);
  });
}

let workerInstance: Worker | null = null;

function getWorkerInstance() {
  if (workerInstance === null) {
    workerInstance = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
  }
  return workerInstance;
}

function terminateWorker() {
  if (workerInstance !== null) {
    workerInstance.terminate();
    workerInstance = null;
  }
}

const evaluationQueue = new WorkerQueue<unknown>(1, terminateWorker);

async function evaluateWithWorker(params: ExpressionEvalParams): Promise<unknown> {
  const worker = getWorkerInstance();
  return new Promise((resolve, reject) => {
    evaluationQueue.enqueue(() =>
      new Promise((resolve, reject) => {
        const listener = (event: MessageEvent) => {
          if (event.data.error) {
            reject(event.data.error);
          } else {
            resolve(event.data);
          }
          worker.removeEventListener("message", listener);
        };

        worker.addEventListener("message", listener);
        worker.onerror = error => {
          reject(error);
          worker.removeEventListener("message", listener);
        };

        worker.postMessage(params);
      })
        .then(resolve)
        .catch(reject),
    );
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasNonExpressionObject(v: any): boolean {
  return typeof v === "object" && v && !("expression" in v) && !Array.isArray(v);
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
