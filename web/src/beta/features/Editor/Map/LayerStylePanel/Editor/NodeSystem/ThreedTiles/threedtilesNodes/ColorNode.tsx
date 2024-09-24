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
  const [expression, setExpression] = useState<string>(
    layerStyle?.value?.["3dtiles"]?.color?.expression || ""
  );
  const [conditions, setConditions] = useState<Condition[]>(
    layerStyle?.value?.["3dtiles"]?.color?.expression?.conditions || []
  );

  return (
    <ColorInputNode
      appearanceType="3dtiles"
      appearanceTypeKey="color"
      title="color"
      {...{
        optionsMenu,
        value,
        setValue,
        expression,
        setExpression,
        conditions,
        setConditions,
        layerStyle,
        setLayerStyle
      }}
    />
  );
};

export default ColorNode;
