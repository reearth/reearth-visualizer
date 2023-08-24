import { useCallback, useEffect, useMemo, useState } from "react";

import { devices } from "@reearth/beta/features/Editor/tabs/widgets/Nav/Devices";
import { useWidgetAlignEditorActivated } from "@reearth/services/state";

import { Tab } from "../Navbar";

import { type ProjectType } from "./tabs/publish/Nav";
import { SelectableItem } from "./tabs/types";
import { type Device } from "./tabs/widgets/Nav";

export default ({ tab }: { tab: Tab }) => {
  const [selectedItem, selectItem] = useState<SelectableItem>();
  const [selectedDevice, setDevice] = useState<Device>("desktop");

  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType>(
    tab === "story" ? "story" : "default",
  );

  const [showWidgetEditor, setWidgetEditor] = useWidgetAlignEditorActivated();

  const handleItemSelect = useCallback(
    (item?: SelectableItem) => selectItem(i => (i?.id == item?.id ? undefined : item)),
    [],
  );

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

  return {
    selectedItem,
    selectedDevice,
    selectedProjectType,
    visualizerWidth,
    showWidgetEditor,
    handleItemSelect,
    handleDeviceChange,
    handleProjectTypeChange,
    handleWidgetEditorToggle,
  };
};
