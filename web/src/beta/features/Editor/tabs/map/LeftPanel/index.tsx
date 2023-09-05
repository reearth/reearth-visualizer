import Loading from "@reearth/beta/components/Loading";
import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import GroupSectionField from "@reearth/beta/features/Editor/tabs/map/LeftPanel/GroupField";
import { useSceneFetcher } from "@reearth/services/api";
import type { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";
import { useTheme } from "@reearth/services/theme";

type Props = {
  sceneId: string;
  layers: NLSLayer[];
  onLayerDelete: (id: string) => void;
  onLayerSelect: (id: string) => void;
};

const MapSidePanel: React.FC<Props> = ({ sceneId, layers, onLayerDelete, onLayerSelect }) => {
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
          children: (
            <GroupSectionField
              groups={groups}
              layers={layers}
              onLayerDelete={onLayerDelete}
              onLayerSelect={onLayerSelect}
            />
          ),
        },
      ]}
    />
  );
};

export default MapSidePanel;
