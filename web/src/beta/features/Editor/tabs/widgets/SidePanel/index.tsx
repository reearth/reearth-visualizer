import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import { useT } from "@reearth/services/i18n";

import useHooks from "./hooks";
import Manager, { ActionArea } from "./Manager";
import Settings from "./Settings";

// TODO: these are currently rough definition
type Props = {
  sceneId?: string;
};

const SidePanel: React.FC<Props> = ({ sceneId }) => {
  const t = useT();

  const {
    selectedWidget,
    propertyItems,
    installedWidgets,
    installableWidgets,
    handleWidgetAdd,
    handleWidgetSelection,
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
            />
          ),
        },
        {
          id: "page",
          title: t("Inspector"),
          hide: !selectedWidget,
          children: selectedWidget && (
            <Settings widgetPropertyId={selectedWidget.propertyId} propertyItems={propertyItems} />
          ),
        },
      ]}
    />
  );
};

export default SidePanel;
