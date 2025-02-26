import { SelectedLayer } from "@reearth/beta/features/Editor/hooks/useLayers";
import {
  GeoJsonFeatureDeleteProps,
  GeoJsonFeatureUpdateProps
} from "@reearth/beta/features/Editor/hooks/useSketch";
import { TabItem, Tabs } from "@reearth/beta/lib/reearth-ui";
import { Geometry, SketchEditingFeature } from "@reearth/core";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle as LayerStyleType } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";
import { FC, useCallback, useMemo, useState } from "react";

import { LayerConfigUpdateProps } from "../../../hooks/useLayers";

import DataSource from "./DataSource";
import FeatureInspector from "./FeatureInspector";
import InfoboxSettings from "./InfoboxSettings";
import LayerStyle from "./LayerStyle";

const LAYER_INSPECTOR_TAB_STORAGE_KEY =
  "reearth-visualizer-map-layer-inspector-tab";

type Props = {
  layerStyles?: LayerStyleType[];
  layers?: NLSLayer[];
  selectedLayer?: SelectedLayer;
  sceneId?: string;
  onLayerConfigUpdate?: (inp: LayerConfigUpdateProps) => void;
  onGeoJsonFeatureUpdate?: (inp: GeoJsonFeatureUpdateProps) => void;
  onGeoJsonFeatureDelete?: (inp: GeoJsonFeatureDeleteProps) => void;
  sketchEditingFeature?: SketchEditingFeature;
  onSketchGeometryEditStart?: () => void;
  onSketchGeometryEditCancel?: () => void;
  onSketchGeometryEditApply?: () => void;
};

export type InspectorFeature = {
  id: string;
  geometry: Geometry | undefined;
  properties: any;
};

const InspectorTabs: FC<Props> = ({
  layers,
  layerStyles,
  selectedLayer,
  sceneId,
  onLayerConfigUpdate,
  onGeoJsonFeatureUpdate,
  onGeoJsonFeatureDelete,
  sketchEditingFeature,
  onSketchGeometryEditStart,
  onSketchGeometryEditCancel,
  onSketchGeometryEditApply
}) => {
  const t = useT();
  const selectedFeature: InspectorFeature | undefined = useMemo(() => {
    if (!selectedLayer?.computedFeature?.id) return;
    const { id, geometry, properties } =
      selectedLayer.layer?.config?.data?.type === "3dtiles" ||
      selectedLayer.layer?.config?.data?.type === "osm-buildings" ||
      selectedLayer.layer?.config?.data?.type === "google-photorealistic" ||
      selectedLayer.layer?.config?.data?.type === "mvt"
        ? selectedLayer.computedFeature
        : (selectedLayer.computedLayer?.features?.find(
            (f) => f.id === selectedLayer.computedFeature?.id
          ) ?? {});

    if (!id) return;
    return {
      id,
      geometry,
      properties
    };
  }, [selectedLayer]);

  const selectedSketchFeature = useMemo(() => {
    if (!selectedLayer?.layer?.sketch) return;

    const { sketch } = selectedLayer.layer;
    const features = sketch?.featureCollection?.features;

    if (!selectedFeature?.properties?.id) return;

    const selectedFeatureId = selectedFeature.properties.id;

    return features?.find(
      (feature) => feature.properties.id === selectedFeatureId
    );
  }, [selectedLayer, selectedFeature]);

  const tabItems: TabItem[] = useMemo(
    () => [
      {
        id: "dataSource",
        icon: "data",
        tooltipText: t("Layer"),
        placement: "left",
        children: selectedLayer?.layer && (
          <DataSource selectedLayer={selectedLayer.layer} />
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
            isEditingGeometry={
              selectedSketchFeature?.properties?.id ===
              sketchEditingFeature?.feature?.id
            }
            onGeoJsonFeatureUpdate={onGeoJsonFeatureUpdate}
            onGeoJsonFeatureDelete={onGeoJsonFeatureDelete}
            onSketchGeometryEditStart={onSketchGeometryEditStart}
            onSketchGeometryEditApply={onSketchGeometryEditApply}
            onSketchGeometryEditCancel={onSketchGeometryEditCancel}
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
    ],
    [
      t,
      selectedLayer?.layer,
      selectedFeature,
      selectedSketchFeature,
      sketchEditingFeature?.feature?.id,
      onGeoJsonFeatureUpdate,
      onGeoJsonFeatureDelete,
      onSketchGeometryEditStart,
      onSketchGeometryEditApply,
      onSketchGeometryEditCancel,
      layerStyles,
      layers,
      sceneId,
      onLayerConfigUpdate
    ]
  );

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
