import { SketchType } from "@reearth/core";
import { useCallback, useEffect, useState } from "react";

import { Tab } from "../../Navbar";
import { Device } from "../Widgets/WASToolsPanel/Devices";

import { LayerSelectProps } from "./useLayers";

export type VisualizerProjectType = "default" | "story";

export type SubProject = {
  id: string;
  type: "scene" | "story";
  projectId: string;
  storyId?: string;
};

type Props = {
  projectId?: string;
  storyId?: string;
  tab: Tab;
  handleLayerSelect: (props: LayerSelectProps) => void;
  handleCoreLayerSelect: (props: LayerSelectProps) => void;
  handleSceneSettingSelect: (collection?: string) => void;
  handleSketchTypeChange: (
    type: SketchType | undefined,
    from: "editor" | "plugin"
  ) => void;
  handleSketchGeometryEditCancel: (ignoreAutoReSelect?: boolean) => void;
};

export default ({
  projectId,
  storyId,
  tab,
  handleLayerSelect,
  handleCoreLayerSelect,
  handleSceneSettingSelect,
  handleSketchTypeChange,
  handleSketchGeometryEditCancel
}: Props) => {
  // Subproject meas scene project or story project
  // Although story is actually part of project, it is treated as a separate project for publish
  const [activeSubProject, setActiveSubProject] = useState<
    SubProject | undefined
  >(
    projectId
      ? {
          id: projectId,
          type: "scene",
          projectId
        }
      : undefined
  );

  const handleActiveSubProjectChange = useCallback(
    (subProject: SubProject | undefined) => setActiveSubProject(subProject),
    []
  );

  useEffect(() => {
    if (!projectId) return;
    switch (tab) {
      case "story":
        if (storyId) {
          setActiveSubProject((prev) =>
            prev?.id === storyId
              ? prev
              : {
                  id: storyId,
                  type: "story",
                  projectId,
                  storyId
                }
          );
        }
        break;
      case "map":
      case "widgets":
        setActiveSubProject((prev) =>
          prev?.id === projectId
            ? prev
            : {
                id: projectId,
                type: "scene",
                projectId
              }
        );
        break;
    }
  }, [projectId, storyId, tab]);

  // ui selections
  const handleLayerSelectFromUI = useCallback(
    (layerId?: string) => {
      handleSceneSettingSelect(undefined);
      handleSketchTypeChange(undefined, "editor");
      handleSketchGeometryEditCancel(true);
      handleLayerSelect({ layerId });
    },
    [
      handleLayerSelect,
      handleSketchTypeChange,
      handleSceneSettingSelect,
      handleSketchGeometryEditCancel
    ]
  );

  const handleCoreLayerSelectFromMap = useCallback(
    (props: LayerSelectProps) => {
      handleSceneSettingSelect(undefined);
      handleCoreLayerSelect(props);
    },
    [handleCoreLayerSelect, handleSceneSettingSelect]
  );

  const handleSceneSettingSelectFromUI = useCallback(
    (collection?: string) => {
      handleLayerSelect(undefined);
      handleSketchTypeChange(undefined, "editor");
      handleSketchGeometryEditCancel(true);
      // change to select layer could effect the scene setting selection
      requestAnimationFrame(() => {
        handleSceneSettingSelect(collection);
      });
    },
    [
      handleLayerSelect,
      handleSceneSettingSelect,
      handleSketchTypeChange,
      handleSketchGeometryEditCancel
    ]
  );

  // modals
  const [dataSourceLayerCreatorShown, setDataSourceLayerShown] =
    useState(false);
  const openDataSourceLayerCreator = useCallback(
    () => setDataSourceLayerShown(true),
    []
  );
  const closeDataSourceLayerCreator = useCallback(
    () => setDataSourceLayerShown(false),
    []
  );

  const [sketchLayerCreatorShown, setSketchLayerCreatorShown] = useState(false);
  const openSketchLayerCreator = useCallback(
    () => setSketchLayerCreatorShown(true),
    []
  );
  const closeSketchLayerCreator = useCallback(
    () => setSketchLayerCreatorShown(false),
    []
  );

  // devices - not in use
  const [selectedDevice, setDevice] = useState<Device>("desktop");
  const handleDeviceChange = useCallback(
    (newDevice: Device) => setDevice(newDevice),
    []
  );
  // const visualizerWidth = useMemo(
  //   () => (tab === "widgets" ? devices[selectedDevice] : "100%"),
  //   [tab, selectedDevice],
  // );

  return {
    activeSubProject,
    handleActiveSubProjectChange,
    handleLayerSelectFromUI,
    handleCoreLayerSelectFromMap,
    handleSceneSettingSelectFromUI,
    dataSourceLayerCreatorShown,
    openDataSourceLayerCreator,
    closeDataSourceLayerCreator,
    sketchLayerCreatorShown,
    openSketchLayerCreator,
    closeSketchLayerCreator,
    selectedDevice,
    handleDeviceChange
  };
};
