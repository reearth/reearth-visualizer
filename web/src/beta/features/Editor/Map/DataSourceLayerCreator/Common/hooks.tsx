import { useState, useMemo, useCallback } from "react";

import { AcceptedFileFormat } from "@reearth/beta/features/Assets/types";
import { DataType } from "@reearth/core";
import { useT } from "@reearth/services/i18n";

import { DataProps, DataSourceOptType, SourceType } from "..";
import { generateTitle } from "../../../utils";

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
    let parsedValue = null;

    if (sourceType === "value" && value !== "") {
      if (fileFormat === "GeoJSON") {
        try {
          parsedValue = JSON.parse(value);
        } catch (error) {
          parsedValue = value;
        }
      } else {
        parsedValue = "data:text/plain;charset=UTF-8," + encodeURIComponent(value);
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
              : fileFormat === "CZML" || fileFormat === "KML"
              ? parsedValue
              : undefined,
          type: fileFormat.toLowerCase() as DataType,
          value: parsedValue,
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

  const handleFileFormatOnChange = useCallback((value: string | string[]) => {
    setFileFormat(value as AcceptedFileFormat);
  }, []);

  const handleDataSourceTypeOnChange = useCallback((newValue: string) => {
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
    handleFileFormatOnChange,
    handleDataSourceTypeOnChange,
    handleSubmit,
  };
};
