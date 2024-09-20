import { MarkerAppearance } from "@reearth/core";
import { FC, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import ColorInputNode, {
  DEFAULT_COLOR_VALUE
} from "../../common/ColorInputNode";
import { Condition } from "../../common/type";

const PointColorNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const [value, setValue] = useState<MarkerAppearance["pointColor"]>(
    layerStyle?.value?.marker?.pointColor ?? DEFAULT_COLOR_VALUE
  );
  const [expression, setExpression] = useState<string>("");
  const [conditions, setConditions] = useState<Condition[]>([]);

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
      conditions={conditions}
      setConditions={setConditions}
    />
  );
};

export default PointColorNode;
