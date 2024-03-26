import { mapValues } from "lodash-es";

import { InfoboxBlock } from "@reearth/beta/lib/core/Crust/Infobox/types";
import { Layer, LayerAppearanceTypes } from "@reearth/beta/lib/core/mantle";
import { DEFAULT_LAYER_STYLE } from "@reearth/beta/utils/value";
import { NLSInfobox, NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";

export const processNewProperty = (p: any): any => {
  if (typeof p !== "object") return p;
  return mapValues(p, g => {
    return Array.isArray(g)
      ? g.map(h => ({
          ...processNewPropertyGroup(h),
          id: h.id,
        }))
      : processNewPropertyGroup(g);
  });
};

function processNewPropertyGroup(g: any): any {
  if (typeof g !== "object") return g;
  return mapValues(g, v => {
    if (Array.isArray(v)) {
      return {
        value: v.map(vv =>
          typeof v === "object" && v && "lat" in v && "lng" in v && "altitude" in v // For compability
            ? { value: { ...vv, height: vv.altitude } }
            : vv,
        ),
      };
    }
    if (typeof v === "object" && v && "lat" in v && "lng" in v && "altitude" in v) {
      return {
        value: {
          ...v,
          height: v.altitude,
        },
      };
    }
    return { value: v };
  });
}

export function processLayers(
  newLayers?: NLSLayer[],
  layerStyles?: LayerStyle[],
): Layer[] | undefined {
  const getLayerStyleValue = (id?: string) => {
    const layerStyleValue: Partial<LayerAppearanceTypes> = layerStyles?.find(
      a => a.id === id,
    )?.value;
    if (typeof layerStyleValue === "object") {
      try {
        return layerStyleValue;
      } catch (e) {
        console.error("Error parsing layerStyle JSON:", e);
      }
    }

    return DEFAULT_LAYER_STYLE;
  };

  return newLayers?.map(nlsLayer => {
    const layerStyle = getLayerStyleValue(nlsLayer.config?.layerStyleId);
    return {
      type: "simple",
      id: nlsLayer.id,
      title: nlsLayer.title,
      visible: nlsLayer.visible,
      infobox: convertInfobox(nlsLayer.infobox),
      properties: nlsLayer.config?.properties,
      defines: nlsLayer.config?.defines,
      events: nlsLayer.config?.events,
      data: nlsLayer.config?.data,
      ...layerStyle,
    };
  });
}

function convertInfobox(infobox: NLSInfobox | null | undefined): Layer["infobox"] {
  if (!infobox) return;
  return {
    property: processNewProperty(infobox.property),
    blocks: infobox.blocks?.map<InfoboxBlock>(b => ({
      id: b.id,
      // name: blockNames?.[b.extensionId] ?? "Infobox Block",
      pluginId: b.pluginId,
      extensionId: b.extensionId,
      property: processNewProperty(b.property),
    })),
  };
}
