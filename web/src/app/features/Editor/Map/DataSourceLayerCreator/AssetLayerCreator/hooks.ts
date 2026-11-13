import { LayerAddProps } from "@reearth/app/features/Editor/hooks/useLayers";
import useLoadMore from "@reearth/app/hooks/useLoadMore";
import { useCMSProjects } from "@reearth/services/api/cms";
import { useT } from "@reearth/services/i18n/hooks";
import { useWorkspace } from "@reearth/services/state";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useFileInput from "use-file-input";

import { wmsLayersFromUrl } from "../UrlLayerCreator/utils";
import { useLayerNames } from "../useLayerNames";

import { AssetLayout, AssetTab, SortKey } from "./types";
import useCmsAssets from "./useCmsAssets";
import useUploads from "./useUploads";
import useVisualizerAssets from "./useVisualizerAssets";
import {
  ACCEPT_STRING,
  ASSET_FORMATS,
  AssetFormat,
  FORMAT_LABELS,
  LayerFormat,
  AddIssue,
  assetFormat,
  checkModelGeoJson,
  needsLayerNames
} from "./utils";

const ALL_FORMATS = "all";
const ALL_PROJECTS = "all";
const MIN_CHECKING_MODEL_GEOMETRY = 2000;

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
  const [projectFilter, setProjectFilter] = useState<string>(ALL_PROJECTS);
  const [keyword, setKeyword] = useState<string>();
  const [selectedId, setSelectedId] = useState<string>();

  // CSV needs a second step to name its coordinate columns, MVT and WMS to
  // name the layers to show.
  const [step, setStep] = useState<"select" | "details">("select");
  const [latColumn, setLatColumn] = useState("");
  const [lngColumn, setLngColumn] = useState("");
  const [prioritizePerformance, setPrioritizePerformance] = useState(false);
  const [autoUpdateTime, setAutoUpdateTime] = useState(true);
  const {
    entered: enteredLayerNames,
    reset: resetLayerNames,
    inputProps: layerNameInputProps
  } = useLayerNames();

  const isCmsTab = tab !== "visualizer";

  // CMS tabs show every project's assets or models until one project is
  // picked.
  const [currentWorkspace] = useWorkspace();
  const { projects: cmsProjects, loading: cmsProjectsLoading } = useCMSProjects(
    { workspaceId: currentWorkspace?.id, skip: !isCmsTab }
  );
  const shownCmsProjects = useMemo(
    () => (isCmsTab ? (cmsProjects ?? []) : []),
    [cmsProjects, isCmsTab]
  );

  const visualizer = useVisualizerAssets({ sort, keyword });
  const cms = useCmsAssets({
    tab: tab === "cmsModels" ? "cmsModels" : "cmsAssets",
    skip: !isCmsTab,
    projects: shownCmsProjects,
    projectId: projectFilter === ALL_PROJECTS ? undefined : projectFilter,
    sort,
    keyword
  });
  const source = isCmsTab ? cms : visualizer;

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
        const format = assetFormat(a);
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

  // A CMS model is checked to serve GeoJSON before it's added, and a private
  // CMS asset isn't added. Why is shown in the modal until dismissed or the
  // selection changes.
  const [checking, setChecking] = useState(false);
  const [addIssue, setAddIssue] = useState<AddIssue>();
  const checkAbortRef = useRef<AbortController>(undefined);
  const cancelCheck = useCallback(() => {
    checkAbortRef.current?.abort();
    setChecking(false);
    setAddIssue(undefined);
  }, []);
  const dismissAddIssue = useCallback(() => setAddIssue(undefined), []);
  useEffect(() => () => checkAbortRef.current?.abort(), []);

  const handleTabChange = useCallback(
    (newTab: AssetTab) => {
      cancelCheck();
      setTab(newTab);
      setSelectedId(undefined);
      // The other tab may not offer the filtered format.
      setFormatFilter(ALL_FORMATS);
      setStep("select");
      resetLayerNames();
      clear();
    },
    [cancelCheck, clear, resetLayerNames]
  );

  // CMS assets can also be MVT, WMS and 3D Tiles. CMS models are always
  // GeoJSON, so their tab has no format filter.
  const formatOptions = useMemo(
    () => [
      { value: ALL_FORMATS, label: t("All formats") },
      ...[
        ...(Object.keys(ASSET_FORMATS) as AssetFormat[]),
        ...(tab === "cmsAssets"
          ? (["mvt", "wms", "3dtiles"] as LayerFormat[])
          : [])
      ].map((f) => ({ value: f, label: FORMAT_LABELS[f] }))
    ],
    [tab, t]
  );

  const projectOptions = useMemo(
    () => [
      { value: ALL_PROJECTS, label: t("All CMS projects") },
      ...(cmsProjects ?? []).map((p) => ({ value: p.id, label: p.name }))
    ],
    [cmsProjects, t]
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

  // Runs when the header submits it (Enter / icon): on the server for
  // Visualizer assets, over the loaded pages for CMS.
  const handleSearch = useCallback((term?: string) => {
    setKeyword(term?.trim() || undefined);
  }, []);

  const handleFormatFilterChange = useCallback((value: string | string[]) => {
    setFormatFilter(value as string);
  }, []);

  // A new selection drops the last one's model check and layer names.
  const handleProjectFilterChange = useCallback(
    (value: string | string[]) => {
      cancelCheck();
      resetLayerNames();
      setProjectFilter(value as string);
      setSelectedId(undefined);
    },
    [cancelCheck, resetLayerNames]
  );

  const handleSelect = useCallback(
    (id: string) => {
      cancelCheck();
      resetLayerNames();
      setSelectedId((prev) => (prev === id ? undefined : id));
    },
    [cancelCheck, resetLayerNames]
  );

  // Selection only counts while the asset is visible (not filtered out).
  const selectedAsset = assets.find((a) => a.id === selectedId);
  const selectedFormat = selectedAsset && assetFormat(selectedAsset);
  const needsLayers = needsLayerNames(selectedFormat);
  const needsDetails = selectedFormat === "csv" || needsLayers;

  // WMS falls back to the URL's LAYERS parameter.
  const layers = useMemo(
    () =>
      !enteredLayerNames.length && selectedFormat === "wms" && selectedAsset
        ? wmsLayersFromUrl(selectedAsset.url)
        : enteredLayerNames,
    [enteredLayerNames, selectedAsset, selectedFormat]
  );

  const canSubmit =
    !checking &&
    !!selectedAsset &&
    !!selectedFormat &&
    (step === "select" ||
      (selectedFormat === "csv"
        ? !!latColumn.trim() && !!lngColumn.trim()
        : layers.length > 0));

  const handleBack = useCallback(() => setStep("select"), []);

  const addIssueMessages: Record<AddIssue, string> = useMemo(
    () => ({
      noGeometry: t(
        "No Geometry field was found in this model, so GeoJSON export is not available."
      ),
      unavailable: t(
        "The model could not be loaded from the CMS Public API. Make sure it is published to the Public API."
      ),
      private: t(
        "This asset is private in CMS, so it cannot be loaded on the map. Make it public in CMS to add it."
      )
    }),
    [t]
  );

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !selectedAsset || !selectedFormat) return;
    if (selectedAsset.private) {
      setAddIssue("private");
      return;
    }
    if (needsDetails && step === "select") {
      setStep("details");
      return;
    }
    if (tab === "cmsModels") {
      const controller = new AbortController();
      checkAbortRef.current = controller;
      setAddIssue(undefined);
      setChecking(true);
      const [issue] = await Promise.all([
        checkModelGeoJson(selectedAsset.url, controller.signal),
        new Promise((resolve) =>
          setTimeout(resolve, MIN_CHECKING_MODEL_GEOMETRY)
        )
      ]);
      if (controller.signal.aborted) return;
      setChecking(false);
      if (issue) {
        setAddIssue(issue);
        return;
      }
    }
    onSubmit({
      layerType: "simple",
      sceneId,

      title:
        tab === "cmsModels"
          ? selectedAsset.name
          : selectedAsset.name.replace(/\.[^.]+$/, ""),
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
          ...(needsLayers && {
            layers: layers.length === 1 ? layers[0] : layers
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
    layers,
    lngColumn,
    needsDetails,
    needsLayers,
    onClose,
    onSubmit,
    prioritizePerformance,
    sceneId,
    selectedAsset,
    selectedFormat,
    step,
    tab
  ]);

  return {
    tab,
    assets,
    loading:
      (source.loading || (isCmsTab && cmsProjectsLoading)) && !assets.length,
    incomplete: !!source.incomplete,
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
    isCmsTab,
    projectFilter,
    projectOptions,
    selectedId,
    selectedFormat,
    selectedAsset,
    step,
    latColumn,
    lngColumn,
    layerNameInputProps,
    prioritizePerformance,
    autoUpdateTime,
    canSubmit,
    checking,
    addError: addIssue && {
      title:
        tab === "cmsModels"
          ? t("Cannot add this Model")
          : t("Cannot add this Asset"),
      message: addIssueMessages[addIssue]
    },
    dismissAddIssue,
    setLayout,
    setLatColumn,
    setLngColumn,
    setPrioritizePerformance,
    setAutoUpdateTime,
    handleTabChange,
    handleSortChange,
    handleSearch,
    handleFormatFilterChange,
    handleProjectFilterChange,
    handleSelect,
    handleBack,
    handleSubmit
  };
};
