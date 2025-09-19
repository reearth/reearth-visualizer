import { InfoboxBlock } from "@reearth/app/features/Visualizer/Crust/Infobox/types";
import { getLayerStyleValue } from "@reearth/app/utils/layer-style";
import { Layer } from "@reearth/core";
import {
  NLSInfobox,
  NLSLayer,
  SketchFeature
} from "@reearth/services/api/layer/types";
import type { LayerStyle } from "@reearth/services/api/layerStyle";
import { mapValues } from "lodash-es";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const processNewProperty = (p: any): any => {
  // Property processing requires dynamic typing
  if (typeof p !== "object") return p;
  return mapValues(p, (g) => {
    return Array.isArray(g)
      ? g.map((h) => ({
          ...processNewPropertyGroup(h),
          id: h.id
        }))
      : processNewPropertyGroup(g);
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processNewPropertyGroup(g: any): any {
  // Property groups have dynamic structure
  if (typeof g !== "object") return g;
  return mapValues(g, (v) => {
    if (Array.isArray(v)) {
      return {
        value: v.map((vv) =>
          typeof v === "object" &&
          v &&
          "lat" in v &&
          "lng" in v &&
          "altitude" in v // For compability
            ? { value: { ...vv, height: vv.altitude } }
            : vv
        )
      };
    }
    if (
      typeof v === "object" &&
      v &&
      "lat" in v &&
      "lng" in v &&
      "altitude" in v
    ) {
      return {
        value: {
          ...v,
          height: v.altitude
        }
      };
    }
    return { value: v };
  });
}

export function processLayers(
  newLayers?: NLSLayer[],
  layerStyles?: LayerStyle[]
): Layer[] | undefined {
  return newLayers?.map((nlsLayer) => {
    const layerStyle = getLayerStyleValue(
      layerStyles,
      nlsLayer.config?.layerStyleId,
      nlsLayer.config?.data?.type
    );
    const sketchLayerData = nlsLayer.isSketch && {
      ...nlsLayer.config.data,
      value: {
        type: "FeatureCollection",
        features: nlsLayer.sketch?.featureCollection?.features.map(
          (feature: SketchFeature) => {
            return {
              ...feature,
              geometry: feature.geometry[0]
            };
          }
        )
      },
      isSketchLayer: true,
      idProperty: "id"
    };

    return {
      type: "simple",
      id: nlsLayer.id,
      title: nlsLayer.title,
      visible: nlsLayer.visible,
      infobox: convertInfobox(nlsLayer.infobox),
      properties: nlsLayer.config?.properties,
      defines: nlsLayer.config?.defines,
      events: nlsLayer.config?.events,
      data: nlsLayer.isSketch ? sketchLayerData : nlsLayer.config?.data,
      ...layerStyle
    };
  });
}

function convertInfobox(
  infobox: NLSInfobox | null | undefined
): Layer["infobox"] {
  if (!infobox) return;
  return {
    property: processNewProperty(infobox.property),
    blocks: infobox.blocks?.map<InfoboxBlock>((b) => ({
      id: b.id,
      // name: blockNames?.[b.extensionId] ?? "Infobox Block",
      pluginId: b.pluginId,
      extensionId: b.extensionId,
      property: processNewProperty(b.property)
    }))
  };
}
