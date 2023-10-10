import React, { useCallback, useState } from "react";

import TabMenu, { TabObject } from "@reearth/beta/components/TabMenu";
import { NLSAppearance } from "@reearth/services/api/appearanceApi/utils";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n"; // If needed

import { LayerConfigUpdateProps } from "../../../useLayers";

import AppearanceSelector from "./AppearanceSelector";

type Props = {
  appearances?: NLSAppearance[];
  layers?: NLSLayer[];
  selectedLayerId: string;
  sceneId?: string;
  onLayerConfigUpdate?: (inp: LayerConfigUpdateProps) => void;
};

const InspectorTabs: React.FC<Props> = ({
  layers,
  appearances,
  selectedLayerId,
  sceneId,
  onLayerConfigUpdate,
}) => {
  const t = useT();
  const [selectedTab, setSelectedTab] = useState("appearanceSelector");

  const handleTabChange = useCallback((newTab: string) => {
    setSelectedTab(newTab);
  }, []);

  const tabs: TabObject[] = [
    {
      id: "appearanceSelector",
      component: (
        <AppearanceSelector
          appearances={appearances}
          layers={layers}
          sceneId={sceneId}
          selectedLayerId={selectedLayerId}
          onLayerConfigUpdate={onLayerConfigUpdate}
        />
      ),
      icon: "appearance",
    },
    {
      id: t("Layer Property Inspector"),
      component: <div>TODO</div>,
      icon: "layerInspector",
    },
  ];

  return <TabMenu tabs={tabs} selectedTab={selectedTab} onSelectedTabChange={handleTabChange} />;
};

export default InspectorTabs;
