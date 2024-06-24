import React, { useCallback, useMemo, useState } from "react";

import TabMenu, { TabObject } from "@reearth/beta/components/TabMenu";
import { SelectedLayer } from "@reearth/beta/features/Editor/hooks/useLayers";
import { GeoJsonFeatureUpdateProps } from "@reearth/beta/features/Editor/hooks/useSketch";
import { Feature } from "@reearth/core";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle as LayerStyleType } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n"; // If needed

import { LayerConfigUpdateProps } from "../../../hooks/useLayers";

import DataSource from "./DataSource";
import FeatureInspector from "./FeatureInspector";
import InfoboxSettings from "./InfoboxSettings";
import LayerStyle from "./LayerStyle";

type Props = {
  layerStyles?: LayerStyleType[];
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
  const [selectedTab, setSelectedTab] = useState("dataSource");

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
        id: "dataSource",
        name: t("Data"),
        component: selectedLayer?.layer ? (
          <DataSource selectedLayer={selectedLayer.layer} />
        ) : undefined,
        icon: "layerInspector",
      },
      {
        id: "featureInspector",
        name: t("Feature"),
        component: selectedFeature ? (
          <FeatureInspector
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
        id: "layerStyle",
        name: t("Styling"),
        component: selectedLayer?.layer?.id ? (
          <LayerStyle
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
        id: "infoboxSettings",
        component: selectedLayer?.layer?.id ? (
          <InfoboxSettings
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
