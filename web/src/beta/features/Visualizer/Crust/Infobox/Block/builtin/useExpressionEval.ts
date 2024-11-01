import { useVisualizer, evalExpression, Feature } from "@reearth/core";
import { useEffect, useState } from "react";

export default (value: unknown | undefined) => {
  const [isReady, setIsReady] = useState(false);
  const [currentValue, setCurrentValue] = useState<unknown | undefined>(value);

  const [lastFeatureSelected, setLastFeatureSelected] = useState<
    string | undefined
  >(undefined);

  const [evaluatedResult, setEvaluatedResult] = useState<string | undefined>(
    undefined
  );

  const visualizer = useVisualizer();

  // We want the useEffect to be called on each render to make sure evaluatedResult is up to date
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // NOTE: core's selectedFeature is not always up to date, but the computed.features from selectedLayer is always up to date
    // TODO: fix it on core
    const selectedLayer = visualizer.current?.layers.selectedLayer();
    const selectedFeature =
      selectedLayer?.type === "simple" && selectedLayer?.data?.isSketchLayer
        ? selectedLayer.computed?.features.find(
            (f) => f.id === visualizer.current?.layers.selectedFeature()?.id
          )
        : visualizer.current?.layers.selectedFeature();

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
        range: selectedFeature.range
      };
      const es = evalExpression(
        {
          expression: currentValue
        },
        undefined,
        simpleFeature
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
  });

  return evaluatedResult;
};
