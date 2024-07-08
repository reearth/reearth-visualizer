import { useState, useMemo, useCallback } from "react";

import { AcceptedFileFormat } from "@reearth/beta/features/Assets/types";
import { DataType } from "@reearth/core";
import { useT } from "@reearth/services/i18n";

import { DataProps, DataSourceOptType, SourceType } from "..";
import { generateTitle } from "../util";

export default ({ sceneId, onClose, onSubmit }: DataProps) => {
  const t = useT();

  const [sourceType, setSourceType] = useState<SourceType>("local");
  const [fileFormat, setFileFormat] = useState<AcceptedFileFormat>("GeoJSON");

  const [value, setValue] = useState("");
  const [layerName, setLayerName] = useState("");
  const [prioritizePerformance, setPrioritizePerformance] = useState(false);
  const dataSourceOptions: DataSourceOptType = useMemo(
    () => [
      { label: t("From Assets"), value: "local" },
      { label: t("From Web"), value: "url" },
      { label: t("From Value"), value: "value" },
    ],
    [t],
  );

  const fileFormatOptions = [
    {
      value: "GeoJSON",
      label: "GeoJSON",
    },
    {
      value: "KML",
      label: "KML",
    },
    {
      value: "CZML",
      label: "CZML",
    },
  ];

  const isValidExtension = useCallback(() => {
    if (sourceType === "url" || sourceType === "local") {
      const extension = value.split(".").pop()?.toLowerCase();
      return extension === fileFormat.toLowerCase();
    }
    return true;
  }, [value, fileFormat, sourceType]);

  const handleSubmit = () => {
    const dataURL = "data:text/plain;charset=UTF-8," + encodeURIComponent(value);

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
              : fileFormat === "CZML" || fileFormat === "KML"
              ? dataURL
              : undefined,
          type: fileFormat.toLowerCase() as DataType,
          value: value,
          geojson: {
            useAsResource: prioritizePerformance,
          },
        },
      },
    });
    onClose();
  };

  const handleOnChange = useCallback((value?: string, name?: string) => {
    setValue(value || "");
    setLayerName(name || "");
  }, []);

  const handleFileFormatChange = useCallback((value: string | string[]) => {
    setFileFormat(value as AcceptedFileFormat);
  }, []);

  const handleDataSourceTypeChange = useCallback((newValue: string) => {
    setSourceType(newValue as SourceType);
    setValue("");
  }, []);

  return {
    value,
    dataSourceOptions,
    fileFormatOptions,
    fileFormat,
    sourceType,
    prioritizePerformance,
    setPrioritizePerformance,
    isValidExtension,
    handleOnChange,
    handleFileFormatChange,
    handleDataSourceTypeChange,
    handleSubmit,
  };
};
