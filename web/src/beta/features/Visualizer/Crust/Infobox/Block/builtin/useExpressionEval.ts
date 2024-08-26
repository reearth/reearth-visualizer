import { useVisualizer, evalExpression, Feature } from "@reearth/core";
import { useEffect, useState } from "react";

export default (value: unknown | undefined) => {
  const [isReady, setIsReady] = useState(false);
  const [currentValue, setCurrentValue] = useState<unknown | undefined>(value);

  const [lastFeatureSelected, setLastFeatureSelected] = useState<
    string | undefined
  >(undefined);

  const [evaluatedResult, setEvaluatedResult] = useState<string | undefined>(
    undefined,
  );

  const visualizer = useVisualizer();

  // We want the useEffect to be called on each render to make sure evaluatedResult is up to date
  useEffect(() => {
    if (!isReady) {
      setIsReady(true);
      return;
    }
    if (currentValue !== value) {
      setCurrentValue(value);
      setEvaluatedResult(undefined);
      return;
    }
    const selectedFeature = visualizer.current?.layers.selectedFeature();
    if (selectedFeature && selectedFeature.id !== lastFeatureSelected) {
      setLastFeatureSelected(selectedFeature.id);
      setEvaluatedResult(undefined);
    } else if (selectedFeature) {
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
          expression: currentValue,
        },
        undefined,
        simpleFeature,
      );
      if (
        (es && typeof es === "string") ||
        typeof es === "number" ||
        typeof es === "boolean"
      ) {
        if (es.toString() !== evaluatedResult) {
          setEvaluatedResult(es.toString());
        }
      }
    }
  }, [
    isReady,
    currentValue,
    value,
    evaluatedResult,
    visualizer,
    lastFeatureSelected,
  ]);

  return evaluatedResult;
};
