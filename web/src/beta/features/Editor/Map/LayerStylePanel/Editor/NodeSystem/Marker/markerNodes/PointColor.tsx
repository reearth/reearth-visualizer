import { MarkerAppearance } from "@reearth/core";
import { FC, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import ColorInputNode, {
  DEFAULT_COLOR_VALUE
} from "../../common/fieldInputNode/ColorInputNode";
import { Condition } from "../../common/type";

const PointColorNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const [value, setValue] = useState<MarkerAppearance["pointColor"]>(
    layerStyle?.value?.marker?.pointColor ?? DEFAULT_COLOR_VALUE
  );
  const [expression, setExpression] = useState<string>(
    layerStyle?.value?.marker?.pointColor?.expression || ""
  );
  const [conditions, setConditions] = useState<Condition[]>(
    layerStyle?.value?.marker?.pointColor?.expression?.conditions || []
  );

  return (
    <ColorInputNode
      appearanceType="marker"
      appearanceTypeKey="pointColor"
      title="PointColor"
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

export default PointColorNode;
