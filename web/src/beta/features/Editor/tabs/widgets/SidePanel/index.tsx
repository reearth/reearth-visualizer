import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import { useT } from "@reearth/services/i18n";

import Manager from "./Manager";
import Settings from "./Settings";

// TODO: these are currently rough definition
type Props = {};

const SidePanel: React.FC<Props> = () => {
  const t = useT();

  return (
    <SidePanelCommon
      location="right"
      contents={[
        {
          id: "story",
          title: t("Widget Manager"),
          maxHeight: "33%",
          children: <Manager />,
        },
        {
          id: "page",
          title: t("Widget Settings"),
          children: <Settings />,
        },
      ]}
    />
  );
};

export default SidePanel;
