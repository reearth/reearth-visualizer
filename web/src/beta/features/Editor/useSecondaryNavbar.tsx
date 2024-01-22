import { ReactNode, useMemo } from "react";

import Toolbar from "@reearth/beta/features/Editor/tabs/map/Toolbar";
import PublishNav, { type ProjectType } from "@reearth/beta/features/Editor/tabs/publish/Nav";
import WidgetNav, { type Device } from "@reearth/beta/features/Editor/tabs/widgets/Nav";
import { Tab } from "@reearth/beta/features/Navbar";
import { InteractionModeType } from "@reearth/beta/lib/core/Crust";
import { SketchType } from "@reearth/beta/lib/core/Map/Sketch/types";

type Props = {
  tab: Tab;
  sceneId?: string;
  id?: string;
  showWidgetEditor?: boolean;
  selectedDevice: Device;
  selectedProjectType?: ProjectType;
  interactionMode: InteractionModeType;
  selectedSketchTool: SketchType | undefined;
  onInteractionModeChange: (mode: InteractionModeType) => void;
  onSelectedSketchToolChange: (tool: SketchType) => void;
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
  interactionMode,
  selectedSketchTool,
  onInteractionModeChange,
  onSelectedSketchToolChange,
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
        return (
          <Toolbar
            interactionMode={interactionMode}
            selectedSketchTool={selectedSketchTool}
            onInteractionModeChange={onInteractionModeChange}
            onSelectedSketchToolChange={onSelectedSketchToolChange}
          />
        );
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
    interactionMode,
    selectedSketchTool,
    onInteractionModeChange,
    onSelectedSketchToolChange,
    handleDeviceChange,
    handleWidgetEditorToggle,
    handleProjectTypeChange,
  ]);

  return {
    secondaryNavbar,
  };
};
