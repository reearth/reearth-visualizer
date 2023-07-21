import { ReactNode, useMemo } from "react";

import SecondaryNav from "@reearth/beta/features/Editor/SecondaryNav";
import WidgetNav, { type Device } from "@reearth/beta/features/Editor/tabs/widgets/Nav";
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
  const secondaryNav = useMemo<ReactNode | undefined>(() => {
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
        return <SecondaryNav>TODO: Publishing navbar</SecondaryNav>;
      case "scene":
      case "story":
      default:
        return undefined;
    }
  }, [tab, selectedDevice, showWidgetEditor, handleDeviceChange, handleWidgetEditorToggle]);

  return {
    secondaryNav,
  };
};
