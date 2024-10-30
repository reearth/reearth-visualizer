import { useT } from "@reearth/services/i18n";
import { useState, useMemo, useCallback } from "react";

import { DataProps, DataSourceOptType, SourceType } from "..";
import { generateTitle } from "../util";

export default ({ sceneId, onClose, onSubmit }: DataProps) => {
  const t = useT();

  const [sourceType, setSourceType] = useState<SourceType>("local");

  const [value, setValue] = useState("");
  const [layerName, setLayerName] = useState("");
  const dataSourceTypeOptions: DataSourceOptType = useMemo(
    () => [
      { label: t("From Assets"), value: "local" },
      { label: t("From Web"), value: "url" },
      { label: t("From Value"), value: "value" }
    ],
    [t]
  );

  const handleSubmit = () => {
    let parsedValue = undefined;

    if (sourceType === "value" && value !== "") {
      {
        parsedValue =
          "data:text/plain;charset=UTF-8," + encodeURIComponent(value);
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
              : parsedValue,
          type: "czml",
          value: parsedValue
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

  const assetsTypes = useMemo(() => ["czml" as const], []);

  return {
    value,
    dataSourceTypeOptions,
    assetsTypes,
    sourceType,
    handleValueChange,
    handleDataSourceTypeChange,
    handleSubmit
  };
};
