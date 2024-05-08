import iconSizes, { IconsSizeType } from "./icons";
import radiusSizes, { RadiusSizesType } from "./radius";
import shadow, { ShadowType } from "./shadow";
import spacingSizes, { SpacingSizesType } from "./spacing";
import zIndexes, { ZIndex } from "./zIndex";

export { default as GlobalStyles } from "./globalStyles";

export type Common = {
  zIndexes: ZIndex;
  spacing: SpacingSizesType;
  icon: IconsSizeType;
  radius: RadiusSizesType;
  shadow: ShadowType;
};

const common: Common = {
  zIndexes,
  spacing: spacingSizes,
  icon: iconSizes,
  radius: radiusSizes,
  shadow,
};

export default common;
