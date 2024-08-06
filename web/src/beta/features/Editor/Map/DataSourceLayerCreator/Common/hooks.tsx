import { useState, useMemo, useCallback } from "react";

import { GisType } from "@reearth/beta/features/AssetsManager/constants";
import { DataType } from "@reearth/core";
import { useT } from "@reearth/services/i18n";

import { DataProps, DataSourceOptType, SourceType } from "..";
import { generateTitle } from "../util";

export default ({ sceneId, onClose, onSubmit }: DataProps) => {
  const t = useT();

  const [sourceType, setSourceType] = useState<SourceType>("local");
  const [fileFormat, setFileFormat] = useState<GisType>("geojson");

  const [value, setValue] = useState("");
  const [layerName, setLayerName] = useState("");
  const [prioritizePerformance, setPrioritizePerformance] = useState(false);
  const dataSourceTypeOptions: DataSourceOptType = useMemo(
    () => [
      { label: t("From Assets"), value: "local" },
      { label: t("From Web"), value: "url" },
      { label: t("From Value"), value: "value" },
    ],
    [t],
  );

  const fileFormatOptions = [
    {
      value: "geojson",
      label: "GeoJSON",
    },
    {
      value: "kml",
      label: "KML",
    },
    {
      value: "czml",
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
      if (fileFormat === "geojson") {
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
              : fileFormat === "czml" || fileFormat === "kml"
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

  const handleValueChange = useCallback((value?: string, name?: string) => {
    setValue(value || "");
    setLayerName(name || "");
  }, []);

  const handleFileFormatChange = useCallback((value: string | string[]) => {
    setFileFormat(value as GisType);
  }, []);

  const handleDataSourceTypeChange = useCallback((newValue: string) => {
    setSourceType(newValue as SourceType);
    setValue("");
  }, []);

  const assetsTypes = useMemo(() => [fileFormat], [fileFormat]);

  return {
    value,
    dataSourceTypeOptions,
    fileFormatOptions,
    fileFormat,
    assetsTypes,
    sourceType,
    prioritizePerformance,
    setPrioritizePerformance,
    isValidExtension,
    handleValueChange,
    handleFileFormatChange,
    handleDataSourceTypeChange,
    handleSubmit,
  };
};
