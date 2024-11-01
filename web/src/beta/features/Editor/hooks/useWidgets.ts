import { WidgetAreaState } from "@reearth/services/state";
import { useCallback, useEffect, useState } from "react";

import { Tab } from "../../Navbar";

export type SelectedWidget = {
  id: string;
  pluginId: string;
  extensionId: string;
  propertyId: string;
};

type Props = {
  tab: Tab;
};

export default ({ tab }: Props) => {
  const [showWASEditor, setShowWASEditor] = useState<boolean | undefined>(
    undefined
  );

  const handleShowWASEditorToggle = useCallback(
    () => setShowWASEditor((show) => !show),
    [setShowWASEditor]
  );

  useEffect(() => {
    if (tab !== "widgets" && showWASEditor) {
      setShowWASEditor(false);
    }
  }, [tab, showWASEditor, setShowWASEditor]);

  const [selectedWidget, setSelectedWidget] = useState<
    SelectedWidget | undefined
  >(undefined);
  const [selectedWidgetArea, setSelectedWidgetArea] = useState<
    WidgetAreaState | undefined
  >(undefined);

  return {
    showWASEditor,
    handleShowWASEditorToggle,
    selectedWidget,
    selectWidget: setSelectedWidget,
    selectedWidgetArea,
    selectWidgetArea: setSelectedWidgetArea
  };
};
