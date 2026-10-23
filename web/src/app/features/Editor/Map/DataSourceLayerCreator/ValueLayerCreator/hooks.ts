import { LayerAddProps } from "@reearth/app/features/Editor/hooks/useLayers";
import { useT } from "@reearth/services/i18n/hooks";
import { useCallback, useMemo, useState } from "react";

import { generateTitle } from "../util";

import {
  VALUE_FORMAT_LABEL,
  ValueFormat,
  ValueIssue,
  detectValueFormat,
  validateValue
} from "./utils";

type Props = {
  sceneId: string;
  onClose: () => void;
  onSubmit: (layerAddInp: LayerAddProps) => void;
};

export default ({ sceneId, onClose, onSubmit }: Props) => {
  const t = useT();

  const [value, setValue] = useState("");
  const [format, setFormat] = useState<ValueFormat>();
  const [prioritizePerformance, setPrioritizePerformance] = useState(false);
  const [autoUpdateTime, setAutoUpdateTime] = useState(true);
  const [error, setError] = useState<string>();
  // Whether the current value+format passed validation. Any change to either
  // resets it, so Add is only enabled for what was actually checked.
  const [verified, setVerified] = useState(false);

  const formatOptions = useMemo(
    () =>
      (Object.keys(VALUE_FORMAT_LABEL) as ValueFormat[]).map((f) => ({
        value: f,
        label: VALUE_FORMAT_LABEL[f]
      })),
    []
  );

  const issueMessage = useCallback(
    (issue: ValueIssue, selected: ValueFormat) => {
      switch (issue.reason) {
        case "unrecognized":
          return t(
            "The pasted value doesn't match any supported format (GeoJSON, CZML or KML)."
          );
        case "wrongFormat":
          return t(
            "This value looks like {{detected}} data, not {{selected}}. Change the format or check the value.",
            {
              detected: VALUE_FORMAT_LABEL[issue.detected],
              selected: VALUE_FORMAT_LABEL[selected]
            }
          );
        case "invalid":
          return selected === "geojson"
            ? t(
                'Invalid GeoJSON: missing or invalid "type", or a "FeatureCollection" without a "features" array.'
              )
            : selected === "czml"
              ? t(
                  'Invalid CZML: the data must be an array of packets whose first packet has "id": "document".'
                )
              : t("Invalid KML: missing <kml> root element or invalid XML.");
      }
    },
    [t]
  );

  const runValidation = useCallback(
    (text: string, selected: ValueFormat) => {
      const issue = text.trim() ? validateValue(text, selected) : undefined;
      setError(issue && issueMessage(issue, selected));
      setVerified(!!text.trim() && !issue);
    },
    [issueMessage]
  );

  const handleValueChange = useCallback((text: string) => {
    setValue(text);
    setError(undefined);
    setVerified(false);
  }, []);

  // Validates once the user has finished entering the value. If no format is
  // chosen yet, it is detected from the value; the user can still change it.
  const handleValueBlur = useCallback(() => {
    if (verified || !value.trim()) return;
    const selected = format ?? detectValueFormat(value);
    if (!selected) {
      setError(issueMessage({ reason: "unrecognized" }, "geojson"));
      return;
    }
    setFormat(selected);
    runValidation(value, selected);
  }, [format, issueMessage, runValidation, value, verified]);

  const handleFormatChange = useCallback(
    (selected: string | string[]) => {
      setFormat(selected as ValueFormat);
      runValidation(value, selected as ValueFormat);
    },
    [runValidation, value]
  );

  const canSubmit = !!format && verified;

  const handleSubmit = useCallback(() => {
    if (!canSubmit || !format) return;
    const text = value.trim();
    const dataUrl = "data:text/plain;charset=UTF-8," + encodeURIComponent(text);
    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateTitle(""),
      visible: true,
      config: {
        data: {
          type: format,
          ...(format === "geojson"
            ? {
                value: JSON.parse(text),
                geojson: { useAsResource: prioritizePerformance }
              }
            : { url: dataUrl }),
          ...(format === "czml" && {
            time: { updateClockOnLoad: autoUpdateTime }
          })
        }
      }
    });
    onClose();
  }, [
    canSubmit,
    format,
    onClose,
    onSubmit,
    prioritizePerformance,
    autoUpdateTime,
    sceneId,
    value
  ]);

  return {
    value,
    format,
    formatOptions,
    prioritizePerformance,
    error,
    canSubmit,
    setPrioritizePerformance,
    autoUpdateTime,
    setAutoUpdateTime,
    handleValueChange,
    handleValueBlur,
    handleFormatChange,
    handleSubmit
  };
};
