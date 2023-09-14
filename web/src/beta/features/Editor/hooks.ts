import { useReactiveVar } from "@apollo/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { devices } from "@reearth/beta/features/Editor/tabs/widgets/Nav/Devices";
import { MapRef } from "@reearth/beta/lib/core/Map/ref";
import { useWidgetAlignEditorActivated, isVisualizerReadyVar } from "@reearth/services/state";

import { Tab } from "../Navbar";

import { type ProjectType } from "./tabs/publish/Nav";
import { type Device } from "./tabs/widgets/Nav";

export default ({ tab }: { sceneId: string; tab: Tab }) => {
  const visualizerRef = useRef<MapRef | null>(null);

  const isVisualizerReady = useReactiveVar(isVisualizerReadyVar);

  const [selectedSceneSetting, setSceneSetting] = useState(false);
  const [selectedDevice, setDevice] = useState<Device>("desktop");
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType>(
    tab === "story" ? "story" : "default",
  );

  useEffect(() => {
    if (isVisualizerReady) {
      // visualizerRef.current?.engine.flyTo({
      //   lat: 11,
      //   lng: 41,
      // });
    }
  }, [isVisualizerReady, visualizerRef]);

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

  return {
    visualizerRef,
    selectedSceneSetting,
    selectedDevice,
    selectedProjectType,
    visualizerWidth,
    showWidgetEditor,
    handleSceneSettingSelect,
    handleDeviceChange,
    handleProjectTypeChange,
    handleWidgetEditorToggle,
  };
};
