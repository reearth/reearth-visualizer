import React, { useCallback, useState } from "react";

import TabMenu, { TabObject } from "@reearth/beta/components/TabMenu";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n"; // If needed

import { LayerConfigUpdateProps } from "../../../useLayers";

import AppearanceSelector from "./LayerStyleSelector";

type Props = {
  layerStyles?: LayerStyle[];
  layers?: NLSLayer[];
  selectedLayerId: string;
  sceneId?: string;
  onLayerConfigUpdate?: (inp: LayerConfigUpdateProps) => void;
};

const InspectorTabs: React.FC<Props> = ({
  layers,
  layerStyles,
  selectedLayerId,
  sceneId,
  onLayerConfigUpdate,
}) => {
  const t = useT();
  const [selectedTab, setSelectedTab] = useState("layerStyleSelector");

  const handleTabChange = useCallback((newTab: string) => {
    setSelectedTab(newTab);
  }, []);

  const tabs: TabObject[] = [
    {
      id: "layerStyleSelector",
      component: (
        <AppearanceSelector
          layerStyles={layerStyles}
          layers={layers}
          sceneId={sceneId}
          selectedLayerId={selectedLayerId}
          onLayerConfigUpdate={onLayerConfigUpdate}
        />
      ),
      icon: "layerStyle",
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
