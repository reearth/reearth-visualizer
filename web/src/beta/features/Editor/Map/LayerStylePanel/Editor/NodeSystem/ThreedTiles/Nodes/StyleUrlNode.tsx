import { Cesium3DTilesAppearance } from "@reearth/core";
import { FC, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import TextInputNode, {
  DEFAULT_TEXT_VALUE
} from "../../common/fieldInputNode/TextInputNode";
import { Condition } from "../../common/type";

const StyleUrlNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const [value, setValue] = useState<Cesium3DTilesAppearance["styleUrl"]>(
    layerStyle?.value["3dtiles"]?.styleUrl ?? DEFAULT_TEXT_VALUE
  );
  const [expression, setExpression] = useState<string>("");
  const [conditions, setConditions] = useState<Condition[]>([]);

  return (
    <TextInputNode
      appearanceType="3dtiles"
      appearanceTypeKey="styleUrl"
      title="StyleUrl"
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

export default StyleUrlNode;
