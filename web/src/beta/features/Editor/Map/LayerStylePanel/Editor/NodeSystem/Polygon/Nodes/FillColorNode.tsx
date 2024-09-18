import { FC } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import ColorInputNode from "../../common/ColorInputNode";

const FillColorNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  return (
    <ColorInputNode
      appearanceType="polygon"
      appearanceTypeKey="fillColor"
      title="FillColor"
      optionsMenu={optionsMenu}
      layerStyle={layerStyle}
      setLayerStyle={setLayerStyle}
    />
  );
};

export default FillColorNode;
