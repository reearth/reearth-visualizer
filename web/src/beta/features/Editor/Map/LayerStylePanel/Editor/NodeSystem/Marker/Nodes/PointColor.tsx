import { MarkerAppearance } from "@reearth/core";
import { FC, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import ColorInputNode, {
  DEFAULT_COLOR_VALUE
} from "../../common/ColorInputNode";

const PointColorNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const [value, setValue] =
    useState<MarkerAppearance["pointColor"]>(DEFAULT_COLOR_VALUE);
  const [expression, setExpression] = useState<string>("");

  return (
    <ColorInputNode
      appearanceType="marker"
      appearanceTypeKey="pointColor"
      title="PointColor"
      optionsMenu={optionsMenu}
      layerStyle={layerStyle}
      setLayerStyle={setLayerStyle}
      value={value}
      setValue={setValue}
      expression={expression}
      setExpression={setExpression}
    />
  );
};

export default PointColorNode;
