import { useVisualizer } from "@reearth/core";
import { useEffect, useState, useMemo } from "react";

export default () => {
  const [isReady, setIsReady] = useState(false);
  const [evaluatedResult, setEvaluatedResult] = useState<string[] | undefined>(
    undefined
  );
  const visualizer = useVisualizer();

  const resultKeys = useMemo(() => {
    const selectedLayer = visualizer.current?.layers.selectedLayer() as {
      computed: {
        layer: {
          sketch?: {
            customPropertySchema?: { properties: Record<string, string> };
          };
        };
      };
    };
    const keys = new Set<string>();

    if (
      selectedLayer?.computed?.layer &&
      "sketch" in selectedLayer.computed.layer
    ) {
      if (selectedLayer?.computed?.layer?.sketch?.customPropertySchema) {
        Object.keys(
          selectedLayer?.computed?.layer?.sketch?.customPropertySchema
        ).forEach((key) => {
          keys.add(key);
        });
      }
      return Array.from(keys);
    }
    return [];
  }, [visualizer]);

  useEffect(() => {
    if (!isReady) {
      setIsReady(true);
      return;
    }

    setEvaluatedResult((prev) => {
      if (
        JSON.stringify(prev) !== JSON.stringify(resultKeys) &&
        resultKeys.length > 0 &&
        !!resultKeys
      ) {
        return resultKeys;
      }
      return prev;
    });
  }, [resultKeys, visualizer, isReady]);

  return evaluatedResult;
};
