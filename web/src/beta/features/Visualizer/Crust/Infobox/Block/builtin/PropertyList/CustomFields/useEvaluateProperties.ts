import { evalExpression, useVisualizer, Feature } from "@reearth/core";
import { isEqual } from "lodash-es";
import { useEffect, useState } from "react";

import { PropertyListItem } from "../ListEditor";

export default (properties: PropertyListItem[] | undefined) => {
  const [isReady, setIsReady] = useState(false);
  const [currentValue, setCurrentValue] = useState<
    PropertyListItem[] | undefined
  >(properties);

  const [evaluatedProperties, setEvaluatedResult] = useState<
    PropertyListItem[] | undefined
  >(undefined);

  const visualizer = useVisualizer();

  // We want the useEffect to be called on each render to make sure evaluatedProperties is up to date
  useEffect(() => {
    if (!isReady) {
      setIsReady(true);
      return;
    }
    if (currentValue !== properties) {
      setCurrentValue(properties);
      setEvaluatedResult(undefined);
      return;
    }
    const selectedFeature = visualizer.current?.layers.selectedFeature();
    if (selectedFeature) {
      const simpleFeature: Feature = {
        id: selectedFeature.id,
        type: "feature",
        geometry: selectedFeature.geometry,
        interval: selectedFeature.interval,
        properties: selectedFeature.properties,
        metaData: selectedFeature.metaData,
        range: selectedFeature.range
      };
      const es = currentValue?.map((v) => {
        const ev = evalExpression(
          {
            expression: v.value
          },
          undefined,
          simpleFeature
        );

        return ev
          ? {
              ...v,
              value: ev
            }
          : undefined;
      });
      if (!isEqual(es, evaluatedProperties)) {
        setEvaluatedResult(es as PropertyListItem[]);
      }
    }
  }, [isReady, currentValue, properties, evaluatedProperties, visualizer]);

  return evaluatedProperties?.filter((ep) => ep !== undefined);
};
