import { ReactNode, useMemo } from "react";

import PublishNav, { type ProjectType } from "@reearth/beta/features/Editor/tabs/publish/Nav";
import WidgetNav, { type Device } from "@reearth/beta/features/Editor/tabs/widgets/Nav";
import { Tab } from "@reearth/beta/features/Navbar";

type Props = {
  tab: Tab;
  projectId?: string;
  showWidgetEditor?: boolean;
  selectedDevice: Device;
  selectedProjectType?: ProjectType;
  handleProjectTypeChange: (type: ProjectType) => void;
  handleDeviceChange: (device: Device) => void;
  handleWidgetEditorToggle: () => void;
};

export default ({
  tab,
  projectId,
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
            projectId={projectId}
            selectedProjectType={selectedProjectType}
            onProjectTypeChange={handleProjectTypeChange}
          />
        );
      case "scene":
      case "story":
      default:
        return undefined;
    }
  }, [
    tab,
    projectId,
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
