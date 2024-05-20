import { ReactNode, SetStateAction, useMemo } from "react";

import Toolbar from "@reearth/beta/features/Editor/tabs/map/Toolbar";
import PublishNav, { type ProjectType } from "@reearth/beta/features/Editor/tabs/publish/Nav";
import WidgetNav, { type Device } from "@reearth/beta/features/Editor/tabs/widgets/Nav";
import { Tab } from "@reearth/beta/features/Navbar";
import { SketchType } from "@reearth/core";
import { WidgetAreaState } from "@reearth/services/state";

type Props = {
  tab: Tab;
  sceneId?: string;
  id?: string;
  showWidgetEditor?: boolean;
  selectedDevice: Device;
  selectedProjectType?: ProjectType;
  sketchType: SketchType | undefined;
  isSketchLayerSelected: boolean;
  handleSketchTypeChange: (tool: SketchType | undefined) => void;
  handleProjectTypeChange: (type: ProjectType) => void;
  handleDeviceChange: (device: Device) => void;
  handleWidgetEditorToggle: () => void;
  selectWidgetArea: (update?: SetStateAction<WidgetAreaState | undefined>) => void;
};

export default ({
  tab,
  sceneId,
  id,
  showWidgetEditor,
  selectedDevice,
  selectedProjectType,
  sketchType,
  isSketchLayerSelected,
  handleSketchTypeChange,
  handleProjectTypeChange,
  handleDeviceChange,
  handleWidgetEditorToggle,
  selectWidgetArea,
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
            setSelectedWidgetArea={selectWidgetArea}
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
            enable={isSketchLayerSelected}
            sketchType={sketchType}
            onSketchTypeChange={handleSketchTypeChange}
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
    sketchType,
    isSketchLayerSelected,
    handleSketchTypeChange,
    handleDeviceChange,
    handleWidgetEditorToggle,
    handleProjectTypeChange,
    selectWidgetArea,
  ]);

  return {
    secondaryNavbar,
  };
};
