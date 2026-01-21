import { useT } from "@reearth/services/i18n/hooks";
import { useState, useMemo, useCallback } from "react";

import { DataProps, DataSourceOptType, SourceType } from "..";
import { generateTitle } from "../util";

export default ({ sceneId, onClose, onSubmit }: DataProps) => {
  const t = useT();

  const [sourceType, setSourceType] = useState<SourceType>("local");

  const [value, setValue] = useState("");
  const [layerName, setLayerName] = useState("");
  const [prioritizePerformance, setPrioritizePerformance] = useState(false);
  const dataSourceTypeOptions: DataSourceOptType = useMemo(
    () => [
      { label: t("From Assets"), value: "local" },
      { label: t("From Web"), value: "url" },
      { label: t("From Value"), value: "value" }
    ],
    [t]
  );

  const isValidGeoJSON = (json: Record<string, unknown>): boolean => {
    return (
      json &&
      typeof json === "object" &&
      (json.type === "FeatureCollection" || json.type === "Feature")
    );
  };

  const handleSubmit = useCallback(() => {
    let parsedValue = null;

    if (sourceType === "value" && value !== "") {
      try {
        parsedValue = JSON.parse(value);
        if (!isValidGeoJSON(parsedValue)) {
          throw new Error(t("Invalid GeoJSON format"));
        }
      } catch (error) {
        console.error("GeoJSON parsing error:", error);
        throw new Error(t("Please enter valid GeoJSON"));
      }
    }

    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateTitle(value, layerName),
      visible: true,
      config: {
        data: {
          url:
            (sourceType === "url" || sourceType === "local") && value !== ""
              ? value
              : undefined,
          type: "geojson",
          value: parsedValue,
          geojson: {
            useAsResource: prioritizePerformance
          }
        }
      }
    });
    onClose();
  }, [
    layerName,
    onClose,
    onSubmit,
    prioritizePerformance,
    sceneId,
    sourceType,
    t,
    value
  ]);

  const handleValueChange = useCallback((value?: string, name?: string) => {
    setValue(value || "");
    setLayerName(name || "");
  }, []);

  const handleDataSourceTypeChange = useCallback((newValue: string) => {
    setSourceType(newValue as SourceType);
    setValue("");
  }, []);

  return {
    value,
    dataSourceTypeOptions,
    sourceType,
    prioritizePerformance,
    setPrioritizePerformance,
    handleValueChange,
    handleDataSourceTypeChange,
    handleSubmit
  };
};
