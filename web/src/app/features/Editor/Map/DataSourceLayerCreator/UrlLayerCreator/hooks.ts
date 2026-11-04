import { LayerAddProps } from "@reearth/app/features/Editor/hooks/useLayers";
import { useT } from "@reearth/services/i18n/hooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { generateTitle } from "../util";

import {
  FORMATS,
  UrlFormat,
  UrlIssue,
  checkResponse,
  inferFormat,
  validateUrl,
  wmsLayersFromUrl
} from "./utils";

type Props = {
  sceneId: string;
  onClose: () => void;
  onSubmit: (layerAddInp: LayerAddProps) => void;
};

export default ({ sceneId, onClose, onSubmit }: Props) => {
  const t = useT();

  const [url, setUrl] = useState("");
  // Inferred from the URL's extension until the user picks one, after which
  // their choice is kept (and a mismatching URL is reported as an error).
  const [format, setFormat] = useState<UrlFormat>();
  const [formatChosen, setFormatChosen] = useState(false);

  const [latColumn, setLatColumn] = useState("");
  const [lngColumn, setLngColumn] = useState("");
  const [isLayerName, setIsLayerName] = useState(false);
  const [layerName, setLayerName] = useState("");
  const [layerNameList, setLayerNameList] = useState<string[]>([]);
  const [prioritizePerformance, setPrioritizePerformance] = useState(false);
  const [autoUpdateTime, setAutoUpdateTime] = useState(true);

  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string>();
  // Whether the current url+format passed validation. Any change to either
  // resets it, so Add is only enabled for what was actually checked.
  const [verified, setVerified] = useState(false);
  const abortRef = useRef<AbortController | undefined>(undefined);

  useEffect(() => () => abortRef.current?.abort(), []);

  const trimmedUrl = url.trim();

  const formatOptions = useMemo(
    () => [
      { value: "geojson", label: "GeoJSON" },
      { value: "csv", label: "CSV" },
      { value: "czml", label: "CZML" },
      { value: "kml", label: "KML" },
      { value: "mvt", label: t("Vector Tiles (MVT)") },
      { value: "wms", label: "WMS" },
      { value: "3dtiles", label: t("3D Tiles") }
    ],
    [t]
  );

  const issueMessage = useCallback(
    (issue: UrlIssue, selected: UrlFormat) => {
      const { label, extensions } = FORMATS[selected];
      switch (issue.reason) {
        case "invalidUrl":
          return t("Enter a valid URL starting with http:// or https://.");
        case "wrongFormat":
          return t(
            "This URL looks like {{detected}} data, not {{selected}}. Change the format or check the URL.",
            { detected: FORMATS[issue.detected].label, selected: label }
          );
        case "extension":
          return t(
            "{{selected}} URLs must end with {{extensions}}. Check the URL or change the format.",
            { selected: label, extensions: extensions.join(" / ") }
          );
        case "missingEntryPoint":
          return t(
            "3D Tiles URLs must point to the tileset entry point (e.g. tileset.json), not a folder."
          );
        case "tileTemplate":
          return t(
            "Vector tile URLs must be a template containing {z}, {x} and {y}."
          );
        case "unreachable":
          return t(
            "The URL could not be reached. Check the link or your network connection."
          );
        case "invalidData":
          return t(
            "The URL returned empty or unreadable data. Check that it points to a valid {{format}} file.",
            { format: label }
          );
      }
    },
    [t]
  );

  // Checks the URL against the format on the client first, then fetches it.
  const runValidation = useCallback(
    async (target: string, selected: UrlFormat) => {
      abortRef.current?.abort();
      setChecking(false);
      setError(undefined);
      setVerified(false);
      if (!target) return;

      let issue = validateUrl(target, selected);
      if (!issue) {
        const controller = new AbortController();
        abortRef.current = controller;
        setChecking(true);
        issue = await checkResponse(target, selected, controller.signal);
        // Superseded by a newer check (URL/format changed) or modal closed.
        if (controller.signal.aborted) return;
        setChecking(false);
      }

      if (issue) setError(issueMessage(issue, selected));
      else setVerified(true);
    },
    [issueMessage]
  );

  const handleUrlChange = useCallback(
    (value: string) => {
      abortRef.current?.abort();
      setChecking(false);
      setUrl(value);
      if (!formatChosen) setFormat(inferFormat(value.trim()));
      setError(undefined);
      setVerified(false);
    },
    [formatChosen]
  );

  // Validates once the user has finished entering the URL (blur / Enter).
  const handleUrlBlur = useCallback(() => {
    if (format && !verified) runValidation(trimmedUrl, format);
  }, [format, runValidation, trimmedUrl, verified]);

  // Selecting a format validates the URL already entered.
  const handleFormatChange = useCallback(
    (value: string | string[]) => {
      setFormat(value as UrlFormat);
      setFormatChosen(true);
      runValidation(trimmedUrl, value as UrlFormat);
    },
    [runValidation, trimmedUrl]
  );

  const handleLayerNameAdd = useCallback(() => {
    const name = layerName.trim();
    if (!name) return;
    setLayerNameList((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setLayerName("");
  }, [layerName]);

  const handleBlur = useCallback(() => {
    handleLayerNameAdd();
    setIsLayerName(false);
  }, [handleLayerNameAdd]);

  const handleLayerNameButtonClick = useCallback(() => {
    handleLayerNameAdd();
    setIsLayerName(true);
  }, [handleLayerNameAdd]);

  const handleLayerNameDelete = useCallback((idx: number) => {
    setLayerNameList((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // Includes a name still being typed so it isn't dropped on a direct Add.
  // WMS falls back to the URL's LAYERS parameter.
  const layers = useMemo(() => {
    const entered = [...new Set([...layerNameList, layerName.trim()])].filter(
      Boolean
    );
    return !entered.length && format === "wms"
      ? wmsLayersFromUrl(trimmedUrl)
      : entered;
  }, [layerNameList, layerName, format, trimmedUrl]);

  const needsLayers = format === "mvt" || format === "wms";

  // A base WMS URL is valid but unusable without layer names. Derived rather
  // than stored so it clears as soon as a layer name is entered.
  const displayedError =
    error ??
    (format === "wms" && verified && !layers.length
      ? t(
          "WMS URLs need at least one layer name. Add a layer below or include LAYERS= in the URL."
        )
      : undefined);

  const canSubmit =
    !!format &&
    verified &&
    !checking &&
    (format !== "csv" || (!!latColumn.trim() && !!lngColumn.trim())) &&
    (!needsLayers || layers.length > 0);

  const handleSubmit = useCallback(() => {
    if (!canSubmit || !format) return;
    onSubmit({
      layerType: "simple",
      sceneId,
      title: generateTitle(trimmedUrl),
      visible: true,
      config: {
        data: {
          url: trimmedUrl,
          type: format,
          ...(format === "csv" && {
            csv: { latColumn: latColumn.trim(), lngColumn: lngColumn.trim() }
          }),
          ...(needsLayers && {
            layers: layers.length === 1 ? layers[0] : layers
          }),
          ...(format === "czml" && {
            time: { updateClockOnLoad: autoUpdateTime }
          }),
          ...(format === "geojson" && {
            geojson: { useAsResource: prioritizePerformance }
          })
        }
      }
    });
    onClose();
  }, [
    canSubmit,
    format,
    latColumn,
    layers,
    lngColumn,
    needsLayers,
    onClose,
    onSubmit,
    prioritizePerformance,
    autoUpdateTime,
    sceneId,
    trimmedUrl
  ]);

  return {
    url,
    format,
    formatOptions,
    latColumn,
    lngColumn,
    layerNameList,
    layerName,
    isLayerName,
    checking,
    error: displayedError,
    canSubmit,
    prioritizePerformance,
    setLatColumn,
    setLngColumn,
    setPrioritizePerformance,
    autoUpdateTime,
    setAutoUpdateTime,
    handleUrlChange,
    handleUrlBlur,
    handleFormatChange,
    setLayerName,
    handleBlur,
    handleLayerNameButtonClick,
    handleLayerNameDelete,
    handleSubmit
  };
};
