import { MarkerAppearance } from "@reearth/core";
import { FC, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import NumberInputNode, {
  DEFAULT_NUMBER_VALUE
} from "../../common/fieldInputNode/NumberInputNode";
import { Condition } from "../../common/type";

const HeightNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const [value, setValue] = useState<MarkerAppearance["height"]>(
    layerStyle?.value?.marker?.height ?? DEFAULT_NUMBER_VALUE
  );
  const [expression, setExpression] = useState<string>(
    layerStyle?.value?.marker?.height?.expression || ""
  );
  const [conditions, setConditions] = useState<Condition[]>(
    layerStyle?.value?.marker?.height?.expression?.conditions || []
  );

  return (
    <NumberInputNode
      appearanceType="marker"
      appearanceTypeKey="height"
      title="Height"
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

export default HeightNode;
