import { FC } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import ColorInputNode from "../../common/ColorInputNode";

const StrokeColorNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  return (
    <ColorInputNode
      appearanceType="polyline"
      appearanceTypeKey="strokeColor"
      title="StrokeColor"
      optionsMenu={optionsMenu}
      layerStyle={layerStyle}
      setLayerStyle={setLayerStyle}
    />
  );
};

export default StrokeColorNode;
