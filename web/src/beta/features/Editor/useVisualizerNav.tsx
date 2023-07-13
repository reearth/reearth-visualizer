import { ReactNode, useMemo } from "react";

import WidgetNav, { type Device } from "@reearth/beta/features/Editor/tabs/widgets/Nav";
import VisualizerNav from "@reearth/beta/features/Editor/VisualizerNav";
import { Tab } from "@reearth/beta/features/Navbar";

type Props = {
  tab: Tab;
  selectedDevice: Device;
  showWidgetEditor?: boolean;
  handleDeviceChange: (device: Device) => void;
  handleWidgetEditorToggle: () => void;
};

export default ({
  tab,
  selectedDevice,
  showWidgetEditor,
  handleDeviceChange,
  handleWidgetEditorToggle,
}: Props) => {
  const visualizerNav = useMemo<ReactNode | undefined>(() => {
    switch (tab) {
      case "widgets":
        return (
          <WidgetNav
            showWidgetEditor={showWidgetEditor}
            selectedDevice={selectedDevice}
            onShowWidgetEditor={handleWidgetEditorToggle}
            onDeviceChange={handleDeviceChange}
          />
        );
      case "publish":
        return <VisualizerNav>TODO: Publishing navbar</VisualizerNav>;
      case "scene":
      case "story":
      default:
        return undefined;
    }
  }, [tab, selectedDevice, showWidgetEditor, handleDeviceChange, handleWidgetEditorToggle]);

  return {
    visualizerNav,
  };
};
