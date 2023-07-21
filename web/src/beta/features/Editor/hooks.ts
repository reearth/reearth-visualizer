import { useCallback, useMemo, useState } from "react";

import { devices } from "@reearth/beta/features/Editor/tabs/widgets/Nav/Devices";
import { useWidgetAlignEditorActivated } from "@reearth/services/state";

import { Tab } from "../Navbar";

import { type Device } from "./tabs/widgets/Nav";

export default ({ tab }: { tab: Tab }) => {
  const [selectedDevice, setDevice] = useState<Device>("desktop");
  const [showWidgetEditor, setWidgetEditor] = useWidgetAlignEditorActivated();

  const handleDeviceChange = useCallback((newDevice: Device) => setDevice(newDevice), []);

  const visualizerWidth = useMemo(
    () => (tab === "widgets" ? devices[selectedDevice] : "100%"),
    [tab, selectedDevice],
  );

  const handleWidgetEditorToggle = useCallback(
    () => setWidgetEditor(show => !show),
    [setWidgetEditor],
  );

  return {
    selectedDevice,
    visualizerWidth,
    showWidgetEditor,
    handleDeviceChange,
    handleWidgetEditorToggle,
  };
};
