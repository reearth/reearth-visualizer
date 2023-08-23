import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import { useT } from "@reearth/services/i18n";

import { StoryPageFragmentFragment } from "../../../StoryPanel/hooks";

type Props = {
  sceneId?: string;
  selectedPage?: StoryPageFragmentFragment;
};

const StoryRightPanel: React.FC<Props> = ({ selectedPage }) => {
  const t = useT();

  console.log("selectedPagessssss", selectedPage);
  return (
    <SidePanelCommon
      location="right"
      contents={[
        {
          id: "story",
          title: t("Page Settings"),
          //   maxHeight: !selectedWidget ? "100%" : "40%",
          children: <div>{selectedPage?.propertyId}</div>,
        },
      ]}
    />
  );
};

export default StoryRightPanel;
