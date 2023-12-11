import { ReactNode, useMemo } from "react";

import PublishNav, { type ProjectType } from "@reearth/beta/features/Editor/tabs/publish/Nav";
import WidgetNav, { type Device } from "@reearth/beta/features/Editor/tabs/widgets/Nav";
import { Tab } from "@reearth/beta/features/Navbar";

type Props = {
  tab: Tab;
  sceneId?: string;
  id?: string;
  showWidgetEditor?: boolean;
  selectedDevice: Device;
  selectedProjectType?: ProjectType;
  handleProjectTypeChange: (type: ProjectType) => void;
  handleDeviceChange: (device: Device) => void;
  handleWidgetEditorToggle: () => void;
};

export default ({
  tab,
  sceneId,
  id,
  showWidgetEditor,
  selectedDevice,
  selectedProjectType,
  handleProjectTypeChange,
  handleDeviceChange,
  handleWidgetEditorToggle,
}: Props) => {
  const secondaryNavbar = useMemo<ReactNode | undefined>(() => {
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
        return (
          <PublishNav
            id={id}
            sceneId={sceneId}
            selectedProjectType={selectedProjectType}
            onProjectTypeChange={handleProjectTypeChange}
          />
        );
      case "map":
      case "story":
      default:
        return undefined;
    }
  }, [
    tab,
    sceneId,
    id,
    selectedDevice,
    selectedProjectType,
    showWidgetEditor,
    handleDeviceChange,
    handleWidgetEditorToggle,
    handleProjectTypeChange,
  ]);

  return {
    secondaryNavbar,
  };
};
