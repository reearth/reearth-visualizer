import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import Settings from "@reearth/beta/features/Editor/SidePanel/Settings";
import { useT } from "@reearth/services/i18n";

import ContainerSettings from "./ContainerSettings";
import useHooks from "./hooks";
import Manager, { ActionArea } from "./Manager";

// TODO: these are currently rough definition
type Props = {
  sceneId?: string;
};

const SidePanel: React.FC<Props> = ({ sceneId }) => {
  const t = useT();

  const {
    selectedWidget,
    selectedWidgetArea,
    propertyItems,
    installedWidgets,
    installableWidgets,
    handleWidgetAdd,
    handleWidgetRemove,
    handleWidgetSelection,
    handleWidgetAreaStateChange,
  } = useHooks({ sceneId });

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
            <Settings id={selectedWidget.propertyId} propertyItems={propertyItems} />
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
