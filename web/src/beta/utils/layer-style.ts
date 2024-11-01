import { defaultStyle } from "@reearth/beta/features/Editor/Map/LayerStylePanel/PresetLayerStyle/presetLayerStyles";
import { LayerAppearanceTypes } from "@reearth/core";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";

export const getLayerStyleValue = (
  layerStyles: LayerStyle[] | undefined,
  id?: string,
  type?: string
) => {
  const layerStyleValue: Partial<LayerAppearanceTypes> | undefined =
    layerStyles?.find((a) => a.id === id)?.value;
  if (typeof layerStyleValue === "object") {
    return layerStyleValue;
  }

  if (type === "czml" || type === "kml") return {};
  return defaultStyle;
};
