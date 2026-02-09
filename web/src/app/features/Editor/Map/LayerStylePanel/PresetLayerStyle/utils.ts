import { LayerStyle } from "@reearth/services/api/layerStyle";

export const getLayerStyleName = (
  baseName: string,
  layerStyles?: LayerStyle[]
) => {
  if (!layerStyles) return `${baseName}.01`;
  const escapedBaseName = baseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const baseNameRegex = new RegExp(`^${escapedBaseName}\\.(\\d+)$`);
  const nextNumber =
    layerStyles.reduce((max, style) => {
      const match = style.name?.match(baseNameRegex);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0) + 1;

  return `${baseName}.${nextNumber.toString().padStart(2, "0")}`;
};
