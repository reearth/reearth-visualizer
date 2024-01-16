import { ReactNode, useMemo } from "react";

import Toolbar from "@reearth/beta/features/Editor/tabs/map/Toolbar";
import PublishNav, { type ProjectType } from "@reearth/beta/features/Editor/tabs/publish/Nav";
import WidgetNav, { type Device } from "@reearth/beta/features/Editor/tabs/widgets/Nav";
import {
  type InteractionModeType,
  type SketchToolType,
} from "@reearth/beta/features/Editor/useInteractionMode";
import { Tab } from "@reearth/beta/features/Navbar";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";

type Props = {
  tab: Tab;
  sceneId?: string;
  id?: string;
  showWidgetEditor?: boolean;
  selectedDevice: Device;
  selectedProjectType?: ProjectType;
  interactionMode: InteractionModeType;
  selectedLayer: NLSLayer | undefined;
  selectedSketchTool: SketchToolType;
  sketchModeDisabled: boolean;
  onInteractionModeChange: (mode: InteractionModeType) => void;
  onSelectedSketchToolChange: (tool: SketchToolType) => void;
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
  selectedLayer,
  selectedSketchTool,
  sketchModeDisabled,
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
            sketchModeDisabled={sketchModeDisabled}
            selectedLayer={selectedLayer}
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
    selectedLayer,
    sketchModeDisabled,
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
