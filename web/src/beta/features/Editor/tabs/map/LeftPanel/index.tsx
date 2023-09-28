import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import GroupSectionField from "@reearth/beta/features/Editor/tabs/map/LeftPanel/GroupField";
import type { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";

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
