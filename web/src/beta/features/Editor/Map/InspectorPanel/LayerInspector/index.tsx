import {
  LayerConfigUpdateProps,
  LayerNameUpdateProps,
  SelectedFeature,
  SelectedLayer
} from "@reearth/beta/features/Editor/hooks/useLayers";
import { GeoJsonFeatureUpdateProps } from "@reearth/beta/features/Editor/hooks/useSketch";
import { TabItem, Tabs } from "@reearth/beta/lib/reearth-ui";
import { ComputedFeature, Geometry } from "@reearth/core";
import { NLSLayer, SketchFeature } from "@reearth/services/api/layersApi/utils";
import { LayerStyle as LayerStyleType } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";
import { FC, useCallback, useMemo, useState } from "react";

import DataSource from "./DataSource";
import FeatureInspector from "./FeatureInspector";
import InfoboxSettings from "./InfoboxSettings";
import LayerStyle from "./LayerStyle";
import PhotoOverlaySettings from "./PhotoOverlaySettings";

const LAYER_INSPECTOR_TAB_STORAGE_KEY =
  "reearth-visualizer-map-layer-inspector-tab";

type Props = {
  layerStyles?: LayerStyleType[];
  layers?: NLSLayer[];
  selectedLayer?: SelectedLayer;
  sceneId?: string;
  selectedFeature?: SelectedFeature;
  selectedSketchFeature?: SketchFeature;
  onLayerConfigUpdate?: (inp: LayerConfigUpdateProps) => void;
  onGeoJsonFeatureUpdate?: (inp: GeoJsonFeatureUpdateProps) => void;
  onLayerNameUpdate?: (inp: LayerNameUpdateProps) => void;
};

export type InspectorFeature = {
  id: string;
  geometry: Geometry | undefined;
  properties: ComputedFeature["properties"];
};

const InspectorTabs: FC<Props> = ({
  layers,
  layerStyles,
  selectedLayer,
  sceneId,
  selectedFeature,
  selectedSketchFeature,
  onLayerConfigUpdate,
  onGeoJsonFeatureUpdate,
  onLayerNameUpdate
}) => {
  const t = useT();

  const tabItems: TabItem[] = useMemo(() => {
    const tabs: TabItem[] = [
      {
        id: "dataSource",
        icon: "data",
        tooltipText: t("Layer"),
        placement: "left",
        children: selectedLayer?.layer && (
          <DataSource
            selectedLayer={selectedLayer.layer}
            onLayerNameUpdate={onLayerNameUpdate}
            onLayerConfigUpdate={onLayerConfigUpdate}
          />
        )
      },
      {
        id: "featureInspector",
        icon: "mapPin",
        placement: "left",
        tooltipText: t("Feature"),
        children: selectedFeature && (
          <FeatureInspector
            selectedFeature={selectedFeature}
            layer={selectedLayer?.layer}
            sketchFeature={selectedSketchFeature}
            onGeoJsonFeatureUpdate={onGeoJsonFeatureUpdate}
          />
        )
      },
      {
        id: "layerStyle",
        icon: "palette",
        placement: "left",
        tooltipText: t("Layer Style"),
        children: selectedLayer?.layer?.id && (
          <LayerStyle
            layerStyles={layerStyles}
            layers={layers}
            sceneId={sceneId}
            selectedLayerId={selectedLayer.layer.id}
            onLayerConfigUpdate={onLayerConfigUpdate}
          />
        )
      },
      {
        id: "infoboxSettings",
        icon: "article",
        placement: "left",
        tooltipText: t("Infobox"),
        children: selectedLayer?.layer?.id && (
          <InfoboxSettings
            selectedLayerId={selectedLayer.layer.id}
            infobox={selectedLayer.layer?.infobox}
          />
        )
      }
    ];

    if (selectedLayer?.layer?.isSketch) {
      tabs.push({
        id: "photoOverlaySettings",
        icon: "image",
        placement: "left",
        tooltipText: t("Photo Overlay"),
        children: (
          <PhotoOverlaySettings
            selectedLayerId={selectedLayer.layer.id}
            photoOverlay={selectedLayer.layer?.photoOverlay}
          />
        )
      });
    }

    return tabs;
  }, [
    t,
    selectedLayer?.layer,
    onLayerNameUpdate,
    onLayerConfigUpdate,
    selectedFeature,
    selectedSketchFeature,
    onGeoJsonFeatureUpdate,
    layerStyles,
    layers,
    sceneId
  ]);

  const [currentTab, setCurrentTab] = useState(
    localStorage.getItem(LAYER_INSPECTOR_TAB_STORAGE_KEY) ?? "dataSource"
  );

  const handleTabChange = useCallback((newTab: string) => {
    setCurrentTab(newTab);
    localStorage.setItem(LAYER_INSPECTOR_TAB_STORAGE_KEY, newTab);
  }, []);

  return (
    <Tabs
      tabs={tabItems}
      currentTab={currentTab}
      position="left"
      onChange={handleTabChange}
    />
  );
};

export default InspectorTabs;
