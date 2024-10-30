import { useT } from "@reearth/services/i18n";
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

  const handleSubmit = () => {
    let parsedValue = null;

    if (sourceType === "value" && value !== "") {
      try {
        parsedValue = JSON.parse(value);
      } catch (_error) {
        parsedValue = value;
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
  };

  const handleValueChange = useCallback((value?: string, name?: string) => {
    setValue(value || "");
    setLayerName(name || "");
  }, []);

  const handleDataSourceTypeChange = useCallback((newValue: string) => {
    setSourceType(newValue as SourceType);
    setValue("");
  }, []);

  const assetsTypes = useMemo(() => ["geojson" as const], []);

  return {
    value,
    dataSourceTypeOptions,
    assetsTypes,
    sourceType,
    prioritizePerformance,
    setPrioritizePerformance,
    handleValueChange,
    handleDataSourceTypeChange,
    handleSubmit
  };
};
