import { useT } from "@reearth/services/i18n";
import { useState, useMemo, useCallback } from "react";

import { DataProps, DataSourceOptType, SourceType } from "..";
import { generateTitle } from "../util";

const useHooks = ({ sceneId, onClose, onSubmit }: DataProps) => {
  const t = useT();

  const [sourceType, setSourceType] = useState<SourceType>("local");
  const [autoUpdateTime, setAutoUpdateTime] = useState(true);

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
    let encodeUrl = undefined;

    if (sourceType === "value" && value !== "") {
      encodeUrl = "data:text/plain;charset=UTF-8," + encodeURIComponent(value);
    }

    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateTitle(value, layerName),
      visible: true,
      config: {
        data: {
          url: sourceType === "value" ? encodeUrl : value || undefined,
          type: "czml",
          time: {
            updateClockOnLoad: autoUpdateTime
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

  return {
    value,
    dataSourceTypeOptions,
    sourceType,
    handleValueChange,
    handleDataSourceTypeChange,
    handleSubmit,
    autoUpdateTime,
    setAutoUpdateTime
  };
};

export default useHooks;
