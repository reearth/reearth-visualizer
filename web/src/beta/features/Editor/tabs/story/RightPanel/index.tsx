import { useMemo } from "react";

import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import { convert } from "@reearth/services/api/propertyApi/utils";
import { useT } from "@reearth/services/i18n";

import { StoryPageFragmentFragment } from "../../../StoryPanel/hooks";

import Settings from "./Settings";

type Props = {
  sceneId?: string;
  selectedPage?: StoryPageFragmentFragment;
};

const StoryRightPanel: React.FC<Props> = ({ selectedPage }) => {
  const t = useT();

  const propertyItems = useMemo(
    () => convert(selectedPage?.property)?.filter(p => p.schemaGroup !== "panel"),
    [selectedPage?.property],
  );

  return (
    <SidePanelCommon
      location="right"
      contents={[
        {
          id: "story",
          title: t("Page Settings"),
          //   maxHeight: !selectedWidget ? "100%" : "40%",
          children: selectedPage && (
            <Settings propertyId={selectedPage.propertyId} propertyItems={propertyItems} />
          ),
        },
      ]}
    />
  );
};

export default StoryRightPanel;
