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
    layerStyle?.value?.["3dtiles"]?.styleUrl ?? DEFAULT_TEXT_VALUE
  );
  const [expression, setExpression] = useState<string>(
    layerStyle?.value?.["3dtiles"]?.styleUrl?.expression || ""
  );
  const [conditions, setConditions] = useState<Condition[]>(
    layerStyle?.value?.["3dtiles"]?.styleUrl?.expression?.conditions || []
  );

  return (
    <TextInputNode
      appearanceType="3dtiles"
      appearanceTypeKey="styleUrl"
      title="StyleUrl"
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

export default StyleUrlNode;
