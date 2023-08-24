import Loading from "@reearth/beta/components/Loading";
import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import Outline from "@reearth/beta/features/Editor/tabs/map/LeftPanel/SceneSettings";
import { useSceneFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
import { useTheme } from "@reearth/services/theme";

import { SelectableItem } from "../../types";

type Props = {
  sceneId: string;
  selectedItem?: SelectableItem;
  onItemSelect?: (item: SelectableItem) => void;
};

const MapSidePanel: React.FC<Props> = ({ sceneId, selectedItem, onItemSelect }) => {
  const t = useT();
  const theme = useTheme();

  const { useSceneQuery } = useSceneFetcher();

  const { scene } = useSceneQuery({ sceneId });

  const groups =
    scene?.property?.schema?.groups.map(g => {
      return {
        id: g.schemaGroupId,
        label: g.title ?? "no",
        active: selectedItem?.type === "scene" && selectedItem?.id === g.schemaGroupId,
      };
    }) ?? [];

  return !groups ? (
    <Loading animationSize={80} animationColor={theme.select.main} />
  ) : (
    <SidePanelCommon
      location="left"
      contents={[
        {
          id: "outline",
          title: t("Outline"),
          children: <Outline groups={groups} onItemSelect={onItemSelect} />,
        },
      ]}
    />
  );
};

export default MapSidePanel;
