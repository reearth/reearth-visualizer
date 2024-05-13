import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { devices } from "@reearth/beta/features/Editor/tabs/widgets/Nav/Devices";
import type { Camera } from "@reearth/beta/utils/value";
import type { FlyTo, MapRef } from "@reearth/core";
import { usePropertyFetcher } from "@reearth/services/api";
import { WidgetAreaState } from "@reearth/services/state";

import type { Tab } from "../Navbar";

import type { ProjectType } from "./tabs/publish/Nav";
import type { Device } from "./tabs/widgets/Nav";

export type SelectedWidget = {
  id: string;
  pluginId: string;
  extensionId: string;
  propertyId: string;
};

export default ({ tab }: { sceneId: string; tab: Tab }) => {
  const visualizerRef = useRef<MapRef | null>(null);

  const [isVisualizerReady, setIsVisualizerReady] = useState<boolean>(false);
  const [currentCamera, setCurrentCamera] = useState<Camera | undefined>(undefined);

  const [selectedDevice, setDevice] = useState<Device>("desktop");
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType>(
    tab === "story" ? "story" : "default",
  );

  const [showDataSourceManager, setShowDataSourceManager] = useState(false);
  const [showSketchLayerManager, setSketchLayerManager] = useState(false);
  const [showWidgetEditor, setWidgetEditor] = useState<boolean | undefined>(undefined);
  const [selectedWidget, setSelectedWidget] = useState<SelectedWidget | undefined>(undefined);
  const [selectedWidgetArea, setSelectedWidgetArea] = useState<WidgetAreaState | undefined>(
    undefined,
  );

  const handleDataSourceManagerCloser = useCallback(() => setShowDataSourceManager(false), []);

  const handleDataSourceManagerOpener = useCallback(() => setShowDataSourceManager(true), []);

  const handleSketchLayerManagerCloser = useCallback(() => setSketchLayerManager(false), []);

  const handleSketchLayerManagerOpener = useCallback(() => setSketchLayerManager(true), []);
  const { useUpdatePropertyValue } = usePropertyFetcher();

  useEffect(() => {
    switch (tab) {
      case "story":
        if (selectedProjectType !== "story") {
          setSelectedProjectType("story");
        }
        break;
      case "map":
      case "widgets":
        if (selectedProjectType === "story") {
          setSelectedProjectType("default");
        }
        break;
    }
  }, [tab, selectedProjectType, setSelectedProjectType]);

  useEffect(() => {
    if (tab !== "widgets" && showWidgetEditor) {
      setWidgetEditor(false);
    }
  }, [tab, showWidgetEditor, setWidgetEditor]);

  const handleDeviceChange = useCallback((newDevice: Device) => setDevice(newDevice), []);

  const handleProjectTypeChange = useCallback(
    (projectType: ProjectType) => setSelectedProjectType(projectType),
    [],
  );

  const visualizerWidth = useMemo(
    () => (tab === "widgets" ? devices[selectedDevice] : "100%"),
    [tab, selectedDevice],
  );

  const handleWidgetEditorToggle = useCallback(
    () => setWidgetEditor(show => !show),
    [setWidgetEditor],
  );

  const handleFlyTo: FlyTo = useCallback(
    (target, options) => {
      if (!isVisualizerReady) return;
      visualizerRef.current?.engine.flyTo(target, options);
    },
    [isVisualizerReady],
  );

  const handleCameraUpdate = useCallback(
    (camera: Camera) => setCurrentCamera(camera),
    [setCurrentCamera],
  );

  const handlePropertyValueUpdate = useCallback(
    async (
      propertyId?: string,
      schemaItemId?: string,
      fieldId?: string,
      itemId?: string,
      vt?: any,
      v?: any,
    ) => {
      if (!propertyId || !schemaItemId || !fieldId || !vt) return;
      await useUpdatePropertyValue(propertyId, schemaItemId, itemId, fieldId, "en", v, vt);
    },
    [useUpdatePropertyValue],
  );

  const handleIsVisualizerUpdate = useCallback(
    (value: boolean) => setIsVisualizerReady(value),
    [setIsVisualizerReady],
  );

  return {
    visualizerRef,
    isVisualizerReady,
    selectedDevice,
    selectedProjectType,
    visualizerWidth,
    showWidgetEditor,
    showDataSourceManager,
    currentCamera,
    showSketchLayerManager,
    selectedWidget,
    selectedWidgetArea,
    handleDataSourceManagerCloser,
    handleDataSourceManagerOpener,
    handleDeviceChange,
    handleProjectTypeChange,
    handleWidgetEditorToggle,
    handleFlyTo,
    handleCameraUpdate,
    handlePropertyValueUpdate,
    handleSketchLayerManagerCloser,
    handleSketchLayerManagerOpener,
    handleIsVisualizerUpdate,
    selectWidgetArea: setSelectedWidgetArea,
    setSelectedWidget,
  };
};
