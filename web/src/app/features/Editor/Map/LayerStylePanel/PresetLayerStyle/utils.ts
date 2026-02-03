import { LayerStyle } from "@reearth/services/api/layerStyle";

export const getLayerStyleName = (
  baseName: string,
  layerStyles?: LayerStyle[]
) => {
  if (!layerStyles) return `${baseName}.01`;
  const nextNumber =
    layerStyles.reduce((max, style) => {
      const escapedBaseName = baseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = style.name?.match(
        new RegExp(`^${escapedBaseName}\\.(\\d+)$`)
      );
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0) + 1;

  return `${baseName}.${nextNumber.toString().padStart(2, "0")}`;
};
