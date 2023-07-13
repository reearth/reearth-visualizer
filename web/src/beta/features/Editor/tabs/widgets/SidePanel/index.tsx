import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import { useT } from "@reearth/services/i18n";

import Manager from "./Manager";
import Settings from "./Settings";

// TODO: these are currently rough definition
type Props = {
  sceneId?: string;
};

const SidePanel: React.FC<Props> = ({ sceneId }) => {
  const t = useT();

  return (
    <SidePanelCommon
      location="right"
      contents={[
        {
          id: "story",
          title: t("Widget Manager"),
          maxHeight: "33%",
          children: <Manager sceneId={sceneId} />,
        },
        {
          id: "page",
          title: t("Inspector"),
          children: <Settings />,
        },
      ]}
    />
  );
};

export default SidePanel;
