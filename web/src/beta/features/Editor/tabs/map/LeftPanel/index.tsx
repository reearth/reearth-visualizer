// import Loading from "@reearth/beta/components/Loading";
import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import GroupSectionField from "@reearth/beta/features/Editor/tabs/map/LeftPanel/GroupField";
import type { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";
// import { useTheme } from "@reearth/services/theme";

import type { LayerNameUpdateProps } from "../../../useLayers";

type Props = {
  layers: NLSLayer[];
  selectedLayerId?: string;
  selectedSceneSetting?: boolean;
  onLayerDelete: (id: string) => void;
  onLayerNameUpdate: (inp: LayerNameUpdateProps) => void;
  onLayerSelect: (id: string) => void;
  onSceneSettingSelect: () => void;
  onDataSourceManagerOpen: () => void;
};

const MapSidePanel: React.FC<Props> = ({
  layers,
  selectedLayerId,
  selectedSceneSetting,
  onLayerDelete,
  onLayerSelect,
  onLayerNameUpdate,
  onSceneSettingSelect,
  onDataSourceManagerOpen,
}) => {
  const t = useT();
  // const theme = useTheme();

  // const { useSceneQuery } = useSceneFetcher();

  // const { scene } = useSceneQuery({ sceneId });

  // const groups = scene?.property?.schema?.groups;

  // return !groups ? (
  //   <Loading animationSize={80} animationColor={theme.select.main} />
  // ) : (
  return (
    <SidePanelCommon
      location="left"
      contents={[
        {
          id: "outline",
          title: t("Outline"),
          children: (
            <GroupSectionField
              layers={layers}
              selectedLayerId={selectedLayerId}
              selectedSceneSetting={selectedSceneSetting}
              onLayerDelete={onLayerDelete}
              onLayerNameUpdate={onLayerNameUpdate}
              onLayerSelect={onLayerSelect}
              onSceneSettingSelect={onSceneSettingSelect}
              onDataSourceManagerOpen={onDataSourceManagerOpen}
            />
          ),
        },
      ]}
    />
  );
};

export default MapSidePanel;
