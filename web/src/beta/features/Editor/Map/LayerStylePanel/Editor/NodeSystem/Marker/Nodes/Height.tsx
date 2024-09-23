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
  const [expression, setExpression] = useState<string>("");
  const [conditions, setConditions] = useState<Condition[]>([]);

  return (
    <NumberInputNode
      appearanceType="marker"
      appearanceTypeKey="height"
      title="Height"
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

export default HeightNode;
