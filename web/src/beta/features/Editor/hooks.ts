import { useCallback, useState } from "react";

import { useWidgetAlignEditorActivated } from "@reearth/services/state";

import { type Device } from "./tabs/widgets/Nav";

export default () => {
  const [selectedDevice, setDevice] = useState<Device>("desktop");
  const [showWidgetEditor, setWidgetEditor] = useWidgetAlignEditorActivated();

  const handleDeviceChange = useCallback((newDevice: Device) => setDevice(newDevice), []);

  const handleWidgetEditorToggle = useCallback(
    () => setWidgetEditor(show => !show),
    [setWidgetEditor],
  );

  return { selectedDevice, showWidgetEditor, handleDeviceChange, handleWidgetEditorToggle };
};
