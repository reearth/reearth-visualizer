import { LayerAddProps } from "@reearth/app/features/Editor/hooks/useLayers";
import useLoadMore from "@reearth/app/hooks/useLoadMore";
import { useT } from "@reearth/services/i18n/hooks";
import { useCallback, useMemo, useState } from "react";
import useFileInput from "use-file-input";

import { AssetLayout, AssetSource, AssetTab, SortKey } from "./types";
import useUploads from "./useUploads";
import useVisualizerAssets from "./useVisualizerAssets";
import { ACCEPT_STRING, ASSET_FORMATS, AssetFormat, formatOf } from "./utils";

const ALL_FORMATS = "all";

// CMS sources aren't connected yet; their tabs show the browser empty.
const EMPTY_SOURCE: AssetSource = {
  assets: [],
  loading: false,
  loadMore: () => undefined
};

type Props = {
  sceneId: string;
  onClose: () => void;
  onSubmit: (layerAddInp: LayerAddProps) => void;
};

export default ({ sceneId, onClose, onSubmit }: Props) => {
  const t = useT();

  const [tab, setTab] = useState<AssetTab>("visualizer");
  const [layout, setLayout] = useState<AssetLayout>("grid");
  const [sort, setSort] = useState<SortKey>("date-desc");
  const [formatFilter, setFormatFilter] = useState<string>(ALL_FORMATS);
  const [keyword, setKeyword] = useState<string>();
  const [selectedId, setSelectedId] = useState<string>();

  // CSV needs a second step to name its coordinate columns.
  const [step, setStep] = useState<"select" | "csvColumns">("select");
  const [latColumn, setLatColumn] = useState("");
  const [lngColumn, setLngColumn] = useState("");
  const [prioritizePerformance, setPrioritizePerformance] = useState(false);
  const [autoUpdateTime, setAutoUpdateTime] = useState(true);

  const visualizer = useVisualizerAssets({ sort, keyword });
  const source = tab === "visualizer" ? visualizer : EMPTY_SOURCE;

  // Files dropped onto the asset area or picked with Upload share one queue.
  const { uploads, uploading, enqueue, remove, clear } = useUploads({
    uploadFile: source.uploadFile
  });
  const openFilePicker = useFileInput(
    (files) => enqueue(Array.from(files ?? [])),
    { accept: ACCEPT_STRING, multiple: true }
  );

  // Back to the assets, with the (last) uploaded one selected.
  const handleUploadSubmit = useCallback(() => {
    const lastDone = [...uploads].reverse().find((u) => u.assetId);
    if (lastDone?.assetId) setSelectedId(lastDone.assetId);
    clear();
  }, [clear, uploads]);

  // Only assets that can become a layer, narrowed by the format filter.
  const assets = useMemo(
    () =>
      source.assets.filter((a) => {
        const format = formatOf(a.url);
        return (
          !!format && (formatFilter === ALL_FORMATS || format === formatFilter)
        );
      }),
    [source.assets, formatFilter]
  );

  const { wrapperRef, contentRef } = useLoadMore({
    data: assets,
    onLoadMore: source.loadMore
  });

  const handleTabChange = useCallback(
    (newTab: AssetTab) => {
      setTab(newTab);
      setSelectedId(undefined);
      setStep("select");
      clear();
    },
    [clear]
  );

  const formatOptions = useMemo(
    () => [
      { value: ALL_FORMATS, label: t("All formats") },
      ...(Object.keys(ASSET_FORMATS) as AssetFormat[]).map((f) => ({
        value: f,
        label: ASSET_FORMATS[f].label
      }))
    ],
    [t]
  );

  const sortOptions = useMemo(
    () => [
      { value: "date-desc", label: t("Last Uploaded") },
      { value: "date-asc", label: t("First Uploaded") },
      { value: "name-asc", label: t("A To Z") },
      { value: "name-desc", label: t("Z To A") },
      { value: "size-asc", label: t("Size Small to Large") },
      { value: "size-desc", label: t("Size Large to Small") }
    ],
    [t]
  );

  const handleSortChange = useCallback((value: string) => {
    setSort(value as SortKey);
  }, []);

  // Search runs on the server, when the header submits it (Enter / icon).
  const handleSearch = useCallback((term?: string) => {
    setKeyword(term?.trim() || undefined);
  }, []);

  const handleFormatFilterChange = useCallback((value: string | string[]) => {
    setFormatFilter(value as string);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? undefined : id));
  }, []);

  // Selection only counts while the asset is visible (not filtered out).
  const selectedAsset = assets.find((a) => a.id === selectedId);
  const selectedFormat = selectedAsset && formatOf(selectedAsset.url);

  const canSubmit =
    !!selectedAsset &&
    !!selectedFormat &&
    (step === "select" || (!!latColumn.trim() && !!lngColumn.trim()));

  const handleBack = useCallback(() => setStep("select"), []);

  const handleSubmit = useCallback(() => {
    if (!canSubmit || !selectedAsset || !selectedFormat) return;
    if (selectedFormat === "csv" && step === "select") {
      setStep("csvColumns");
      return;
    }
    onSubmit({
      layerType: "simple",
      sceneId,
      // The asset name without its extension, e.g. "active_volcanoes".
      title: selectedAsset.name.replace(/\.[^.]+$/, ""),
      visible: true,
      config: {
        data: {
          url: selectedAsset.url,
          type: selectedFormat,
          ...(selectedFormat === "geojson" && {
            geojson: { useAsResource: prioritizePerformance }
          }),
          ...(selectedFormat === "csv" && {
            csv: { latColumn: latColumn.trim(), lngColumn: lngColumn.trim() }
          }),
          ...(selectedFormat === "czml" && {
            time: { updateClockOnLoad: autoUpdateTime }
          })
        }
      }
    });
    onClose();
  }, [
    autoUpdateTime,
    canSubmit,
    latColumn,
    lngColumn,
    onClose,
    onSubmit,
    prioritizePerformance,
    sceneId,
    selectedAsset,
    selectedFormat,
    step
  ]);

  return {
    tab,
    assets,
    loading: source.loading && !assets.length,
    upload: source.uploadFile ? openFilePicker : undefined,
    uploads,
    uploading,
    handleDropFiles: source.uploadFile ? enqueue : undefined,
    handleUploadRemove: remove,
    handleUploadSubmit,
    wrapperRef,
    contentRef,
    layout,
    sort,
    sortOptions,
    formatFilter,
    formatOptions,
    selectedId,
    selectedFormat,
    selectedAsset,
    step,
    latColumn,
    lngColumn,
    prioritizePerformance,
    autoUpdateTime,
    canSubmit,
    setLayout,
    setLatColumn,
    setLngColumn,
    setPrioritizePerformance,
    setAutoUpdateTime,
    handleTabChange,
    handleSortChange,
    handleSearch,
    handleFormatFilterChange,
    handleSelect,
    handleBack,
    handleSubmit
  };
};
