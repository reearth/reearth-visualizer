import { useReactiveVar } from "@apollo/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { devices } from "@reearth/beta/features/Editor/tabs/widgets/Nav/Devices";
import type { MapRef } from "@reearth/beta/lib/core/Map/ref";
import type { FlyTo } from "@reearth/beta/lib/core/types";
import type { Camera } from "@reearth/beta/utils/value";
import {
  useWidgetAlignEditorActivated,
  isVisualizerReadyVar,
  currentCameraVar,
} from "@reearth/services/state";

import type { Tab } from "../Navbar";

import type { ProjectType } from "./tabs/publish/Nav";
import type { Device } from "./tabs/widgets/Nav";

export default ({ tab }: { sceneId: string; tab: Tab }) => {
  const visualizerRef = useRef<MapRef | null>(null);

  const isVisualizerReady = useReactiveVar(isVisualizerReadyVar);
  const currentCamera = useReactiveVar(currentCameraVar);

  const [selectedSceneSetting, setSceneSetting] = useState(false);
  const [selectedDevice, setDevice] = useState<Device>("desktop");
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType>(
    tab === "story" ? "story" : "default",
  );

  const [showDataSourceManager, setShowDataSourceManager] = useState(false);

  const handleDataSourceManagerCloser = useCallback(() => {
    setShowDataSourceManager(false);
  }, []);

  const handleDataSourceManagerOpener = useCallback(() => {
    setShowDataSourceManager(true);
  }, []);

  const [showWidgetEditor, setWidgetEditor] = useWidgetAlignEditorActivated();

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

  const handleSceneSettingSelect = useCallback(() => setSceneSetting(selected => !selected), []);

  const handleFlyTo: FlyTo = useCallback(
    (target, options) => {
      if (!isVisualizerReady) return;
      visualizerRef.current?.engine.flyTo(target, options);
    },
    [isVisualizerReady],
  );

  const handleCameraUpdate = useCallback((camera: Camera) => currentCameraVar(camera), []);

  return {
    visualizerRef,
    selectedSceneSetting,
    selectedDevice,
    selectedProjectType,
    visualizerWidth,
    showWidgetEditor,
    showDataSourceManager,
    currentCamera,
    handleDataSourceManagerCloser,
    handleDataSourceManagerOpener,
    handleSceneSettingSelect,
    handleDeviceChange,
    handleProjectTypeChange,
    handleWidgetEditorToggle,
    handleFlyTo,
    handleCameraUpdate,
  };
};
