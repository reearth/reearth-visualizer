import Loading from "@reearth/beta/components/Loading";
import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import GroupSectionField from "@reearth/beta/features/Editor/tabs/map/SidePanel/GroupField";
import { useSceneFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
import { useTheme } from "@reearth/services/theme";

type Props = {
  sceneId: string;
};

const MapSidePanel: React.FC<Props> = ({ sceneId }) => {
  const t = useT();
  const theme = useTheme();

  const { useSceneQuery } = useSceneFetcher();

  const { scene } = useSceneQuery({ sceneId });

  const groups = scene?.property?.schema?.groups;

  return !groups ? (
    <Loading animationSize={80} animationColor={theme.select.main} />
  ) : (
    <SidePanelCommon
      location="left"
      contents={[
        {
          id: "outline",
          title: t("Outline"),
          children: <GroupSectionField groups={groups} />,
        },
      ]}
    />
  );
};

export default MapSidePanel;
