import { Cesium3DTilesAppearance } from "@reearth/core";
import { FC, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import ColorInputNode, {
  DEFAULT_COLOR_VALUE
} from "../../common/fieldInputNode/ColorInputNode";
import { Condition } from "../../common/type";

const ColorNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const [value, setValue] = useState<Cesium3DTilesAppearance["color"]>(
    layerStyle?.value?.["3dtiles"]?.color ?? DEFAULT_COLOR_VALUE
  );
  const [expression, setExpression] = useState<string>("");
  const [conditions, setConditions] = useState<Condition[]>([]);

  return (
    <ColorInputNode
      appearanceType="3dtiles"
      appearanceTypeKey="color"
      title="color"
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

export default ColorNode;
