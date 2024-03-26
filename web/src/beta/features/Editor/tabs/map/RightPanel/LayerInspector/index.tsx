import React, { useCallback, useMemo, useState } from "react";

import TabMenu, { TabObject } from "@reearth/beta/components/TabMenu";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n"; // If needed
import { SelectedLayer } from "@reearth/services/state";

import { LayerConfigUpdateProps } from "../../../../useLayers";

import FeatureData from "./FeatureData";
import Infobox from "./infobox";
import LayerData from "./LayerData";
import LayerTab from "./LayerStyle";

type Props = {
  layerStyles?: LayerStyle[];
  layers?: NLSLayer[];
  selectedLayerId: SelectedLayer;
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
  const [selectedTab, setSelectedTab] = useState("layerData");

  const handleTabChange = useCallback((newTab: string) => {
    setSelectedTab(newTab);
  }, []);

  const selectedLayer = useMemo(
    () => layers?.find(l => l.id === selectedLayerId.layerId),
    [layers, selectedLayerId],
  );

  const selectedFeature = useMemo(() => {
    if (!selectedLayerId?.feature?.id) return;
    const { id, geometry, properties } =
      selectedLayer?.config?.data?.type === "3dtiles"
        ? selectedLayerId.feature
        : selectedLayerId.layer?.features?.find(f => f.id === selectedLayerId.feature?.id) ?? {};
    if (!id) return;
    return {
      id,
      geometry,
      properties,
    };
  }, [selectedLayerId, selectedLayer?.config?.data?.type]);

  const tabs: TabObject[] = useMemo(
    () => [
      {
        id: "layerData",
        name: t("Data"),
        component: selectedLayer && <LayerData selectedLayer={selectedLayer} />,
        icon: "layerInspector",
      },
      {
        id: "featureData",
        name: t("Feature"),
        component: selectedFeature && <FeatureData selectedFeature={selectedFeature} />,
        icon: "marker",
      },
      {
        id: "layerStyleSelector",
        name: t("Styling"),
        component: selectedLayer && (
          <LayerTab
            layerStyles={layerStyles}
            layers={layers}
            sceneId={sceneId}
            selectedLayerId={selectedLayer.id}
            onLayerConfigUpdate={onLayerConfigUpdate}
          />
        ),
        icon: "layerStyle",
      },
      {
        id: "infobox",
        component: selectedLayer && (
          <Infobox selectedLayerId={selectedLayer.id} infobox={selectedLayer.infobox} />
        ),
        icon: "infobox",
      },
    ],
    [sceneId, selectedLayer, selectedFeature, layerStyles, layers, t, onLayerConfigUpdate],
  );

  return <TabMenu tabs={tabs} selectedTab={selectedTab} onSelectedTabChange={handleTabChange} />;
};

export default InspectorTabs;
