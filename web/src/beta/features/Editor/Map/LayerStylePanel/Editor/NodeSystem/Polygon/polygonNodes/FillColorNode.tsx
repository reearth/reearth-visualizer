import { PolygonAppearance } from "@reearth/core";
import { FC, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import ColorInputNode, {
  DEFAULT_COLOR_VALUE
} from "../../common/fieldInputNode/ColorInputNode";
import { Condition } from "../../common/type";

const FillColorNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const [value, setValue] = useState<PolygonAppearance["fillColor"]>(
    layerStyle?.value?.polygon?.fillColor ?? DEFAULT_COLOR_VALUE
  );
  const [expression, setExpression] = useState<string>(
    layerStyle?.value?.polygon?.fillColor?.expression || ""
  );
  const [conditions, setConditions] = useState<Condition[]>(
    layerStyle?.value?.polygon?.fillColor?.expression?.conditions || []
  );

  return (
    <ColorInputNode
      appearanceType="polygon"
      appearanceTypeKey="fillColor"
      title="FillColor"
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

export default FillColorNode;
