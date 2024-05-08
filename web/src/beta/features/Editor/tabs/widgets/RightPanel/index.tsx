import { SetStateAction } from "react";

import { SelectedWidget } from "@reearth/beta/features/Editor/hooks";
import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import Settings from "@reearth/beta/features/Editor/SidePanel/Settings";
import { Camera } from "@reearth/beta/utils/value";
import { FlyTo } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { WidgetAreaState } from "@reearth/services/state";

import ContainerSettings from "./ContainerSettings";
import useHooks from "./hooks";
import Manager, { ActionArea } from "./Manager";

type Props = {
  sceneId?: string;
  currentCamera?: Camera;
  selectedWidget: SelectedWidget | undefined;
  selectedWidgetArea: WidgetAreaState | undefined;
  onFlyTo?: FlyTo;
  setSelectedWidget: (value: SelectedWidget | undefined) => void;
  setSelectedWidgetArea: (update?: SetStateAction<WidgetAreaState | undefined>) => void;
};

const SidePanel: React.FC<Props> = ({
  sceneId,
  currentCamera,
  selectedWidget,
  selectedWidgetArea,
  onFlyTo,
  setSelectedWidget,
  setSelectedWidgetArea,
}) => {
  const t = useT();

  const {
    propertyItems,
    installedWidgets,
    installableWidgets,
    handleWidgetAdd,
    handleWidgetRemove,
    handleWidgetSelection,
    handleWidgetAreaStateChange,
  } = useHooks({
    sceneId,
    selectedWidget,
    selectedWidgetArea,
    setSelectedWidget,
    setSelectedWidgetArea,
  });

  return (
    <SidePanelCommon
      location="right"
      contents={[
        {
          id: "story",
          title: t("Widget Manager"),
          actions: (
            <ActionArea installableWidgets={installableWidgets} onWidgetAdd={handleWidgetAdd} />
          ),
          maxHeight: !selectedWidget ? "100%" : "40%",
          children: (
            <Manager
              selectedWidget={selectedWidget}
              installedWidgets={installedWidgets}
              onWidgetSelection={handleWidgetSelection}
              onWidgetRemove={handleWidgetRemove}
            />
          ),
        },
        {
          id: "page",
          title: t("Inspector"),
          hide: !selectedWidget,
          children: selectedWidget && (
            <Settings
              id={selectedWidget.propertyId}
              propertyItems={propertyItems}
              currentCamera={currentCamera}
              onFlyTo={onFlyTo}
            />
          ),
        },
        {
          id: "containerSettings",
          title: t("Container Settings"),
          hide: !selectedWidgetArea,
          children: selectedWidgetArea && sceneId && (
            <ContainerSettings
              widgetArea={selectedWidgetArea}
              onWidgetAreaStateChange={handleWidgetAreaStateChange}
            />
          ),
        },
      ]}
    />
  );
};

export default SidePanel;
