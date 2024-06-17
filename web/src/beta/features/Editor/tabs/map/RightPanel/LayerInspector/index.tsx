import React, { useCallback, useMemo, useState } from "react";

import TabMenu, { TabObject } from "@reearth/beta/components/TabMenu";
import { SelectedLayer } from "@reearth/beta/features/Editor/useLayers";
import { GeoJsonFeatureUpdateProps } from "@reearth/beta/features/Editor/useSketch";
import { Feature } from "@reearth/core";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n"; // If needed

import { LayerConfigUpdateProps } from "../../../../useLayers";

import FeatureData from "./FeatureData";
import Infobox from "./infobox";
import LayerData from "./LayerData";
import LayerTab from "./LayerStyle";

type Props = {
  layerStyles?: LayerStyle[];
  layers?: NLSLayer[];
  selectedLayer?: SelectedLayer;
  sceneId?: string;
  onLayerConfigUpdate?: (inp: LayerConfigUpdateProps) => void;
  onGeoJsonFeatureUpdate?: (inp: GeoJsonFeatureUpdateProps) => void;
};

const InspectorTabs: React.FC<Props> = ({
  layers,
  layerStyles,
  selectedLayer,
  sceneId,
  onLayerConfigUpdate,
  onGeoJsonFeatureUpdate,
}) => {
  const t = useT();
  const [selectedTab, setSelectedTab] = useState("layerData");

  const handleTabChange = useCallback((newTab: string) => {
    setSelectedTab(newTab);
  }, []);

  const selectedFeature = useMemo(() => {
    if (!selectedLayer?.computedFeature?.id) return;
    const { id, geometry, properties } =
      selectedLayer.layer?.config?.data?.type === "3dtiles" ||
      selectedLayer.layer?.config?.data?.type === "mvt"
        ? selectedLayer.computedFeature
        : selectedLayer.computedLayer?.features?.find(
            f => f.id === selectedLayer.computedFeature?.id,
          ) ?? {};

    if (!id) return;
    return {
      id,
      geometry,
      properties,
    };
  }, [selectedLayer]);

  const selectedSketchFeature = useMemo(() => {
    if (!selectedLayer?.layer?.sketch) return;

    const { sketch } = selectedLayer.layer;
    const features = sketch.featureCollection.features;

    if (!selectedFeature?.properties?.id) return;

    const selectedFeatureId = selectedFeature.properties.id;

    return features.find((feature: Feature) => feature.properties.id === selectedFeatureId);
  }, [selectedLayer, selectedFeature]);

  const tabs: TabObject[] = useMemo(
    () => [
      {
        id: "layerData",
        name: t("Data"),
        component: selectedLayer?.layer ? (
          <LayerData selectedLayer={selectedLayer.layer} />
        ) : undefined,
        icon: "layerInspector",
      },
      {
        id: "featureData",
        name: t("Feature"),
        component: selectedFeature ? (
          <FeatureData
            selectedFeature={selectedFeature}
            isSketchLayer={selectedLayer?.layer?.isSketch}
            customProperties={selectedLayer?.layer?.sketch?.customPropertySchema}
            layerId={selectedLayer?.layer?.id}
            sketchFeature={selectedSketchFeature}
            onGeoJsonFeatureUpdate={onGeoJsonFeatureUpdate}
          />
        ) : undefined,
        icon: "marker",
      },
      {
        id: "layerStyleSelector",
        name: t("Styling"),
        component: selectedLayer?.layer?.id ? (
          <LayerTab
            layerStyles={layerStyles}
            layers={layers}
            sceneId={sceneId}
            selectedLayerId={selectedLayer.layer.id}
            onLayerConfigUpdate={onLayerConfigUpdate}
          />
        ) : undefined,
        icon: "layerStyle",
      },
      {
        id: "infobox",
        component: selectedLayer?.layer?.id ? (
          <Infobox
            selectedLayerId={selectedLayer.layer.id}
            infobox={selectedLayer.layer?.infobox}
          />
        ) : undefined,
        icon: "infobox",
      },
    ],
    [
      t,
      selectedLayer,
      selectedFeature,
      selectedSketchFeature,
      onGeoJsonFeatureUpdate,
      layerStyles,
      layers,
      sceneId,
      onLayerConfigUpdate,
    ],
  );

  return (
    <TabMenu
      tabs={tabs}
      scrollable={true}
      selectedTab={selectedTab}
      onSelectedTabChange={handleTabChange}
    />
  );
};

export default InspectorTabs;
