import { useEffect, useState } from "react";

import { Feature } from "@reearth/beta/lib/core/mantle";
import { evalExpression } from "@reearth/beta/lib/core/mantle/evaluator/simple";
import { useVisualizer } from "@reearth/beta/lib/core/Visualizer";

export default (value?: unknown | undefined) => {
  const [isReady, setIsReady] = useState(false);

  const [evaluatedResult, setEvaluatedResult] = useState<string | undefined>(undefined);

  const visualizer = useVisualizer();

  useEffect(() => {
    if (!isReady) {
      setIsReady(true);
      return;
    }

    const selectedFeature = visualizer.current?.layers.selectedFeature();
    if (selectedFeature && !evaluatedResult) {
      const simpleFeature: Feature = {
        id: selectedFeature.id,
        type: "feature",
        geometry: selectedFeature.geometry,
        interval: selectedFeature.interval,
        properties: selectedFeature.properties,
        metaData: selectedFeature.metaData,
        range: selectedFeature.range,
      };
      const es = evalExpression(
        {
          expression: value,
        },
        undefined,
        simpleFeature,
      );
      if ((es && typeof es === "string") || typeof es === "number" || typeof es === "boolean") {
        setEvaluatedResult(es.toString());
      }
    }
  }, [isReady, visualizer, evaluatedResult, value]);

  return evaluatedResult;
};
