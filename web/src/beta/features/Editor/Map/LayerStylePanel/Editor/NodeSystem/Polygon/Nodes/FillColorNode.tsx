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
  const [expression, setExpression] = useState<string>("");
  const [conditions, setConditions] = useState<Condition[]>([]);

  return (
    <ColorInputNode
      appearanceType="polygon"
      appearanceTypeKey="fillColor"
      title="FillColor"
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

export default FillColorNode;
