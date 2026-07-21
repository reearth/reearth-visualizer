import { evalExpression, Feature, ComputedFeature } from "@reearth/core";
import { isEqual } from "lodash-es";
import { useEffect, useState } from "react";

import { PropertyListItem } from "../ListEditor";

export type EvaluatedPropertyListItem = Omit<PropertyListItem, "value"> & {
  value: unknown;
};

type Props = {
  selectedFeature?: ComputedFeature;
  properties?: PropertyListItem[];
};
export default ({ properties, selectedFeature }: Props) => {
  const [isReady, setIsReady] = useState(false);
  const [currentValue, setCurrentValue] = useState<
    PropertyListItem[] | undefined
  >(properties);

  const [evaluatedProperties, setEvaluatedResult] = useState<
    EvaluatedPropertyListItem[] | undefined
  >(undefined);

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

        return ev !== undefined && ev !== null
          ? { ...v, value: ev }
          : undefined;
      });
      const filtered = es?.filter(
        (e): e is EvaluatedPropertyListItem => e !== undefined
      );
      if (!isEqual(filtered, evaluatedProperties)) {
        setEvaluatedResult(filtered);
      }
    }
  }, [isReady, currentValue, properties, evaluatedProperties, selectedFeature]);

  return evaluatedProperties;
};
