import { defaultStyle } from "@reearth/app/features/Editor/Map/LayerStylePanel/PresetLayerStyle/presetLayerStyles";
import { LayerAppearanceTypes } from "@reearth/core";
import type { LayerStyle } from "@reearth/services/api/layerStyle";

export const getLayerStyleValue = (
  layerStyles: LayerStyle[] | undefined,
  id?: string,
  type?: string
) => {
  const layerStyleValue: Partial<LayerAppearanceTypes> | undefined =
    layerStyles?.find((a) => a.id === id)?.value;

  const typeInLowercase = type?.toLowerCase() ?? "";

  if (layerStyleValue !== null && typeof layerStyleValue === "object") {
    return layerStyleValue;
  }

  if (["czml", "kml"].includes(typeInLowercase)) return {};

  return defaultStyle;
};
