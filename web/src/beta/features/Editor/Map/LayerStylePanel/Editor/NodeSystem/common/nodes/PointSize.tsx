import { Cesium3DTilesAppearance, MarkerAppearance } from "@reearth/core";
import { FC, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import NumberInputNode, {
  DEFAULT_NUMBER_VALUE
} from "../../common/NumberInputNode";
import { AppearanceType, Condition } from "../../common/type";

const PointSizeNode: FC<
  LayerStyleProps & {
    appearanceType: AppearanceType;
  }
> = ({ optionsMenu, layerStyle, appearanceType, setLayerStyle }) => {
  const [value, setValue] = useState<
    MarkerAppearance["pointSize"] | Cesium3DTilesAppearance["pointSize"]
  >(layerStyle?.value[appearanceType]?.pointSize ?? DEFAULT_NUMBER_VALUE);
  const [conditions, setConditions] = useState<Condition[]>([]);

  const [expression, setExpression] = useState<string>("");
  return (
    <NumberInputNode
      appearanceType={appearanceType}
      appearanceTypeKey="pointSize"
      title="PointSize"
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

export default PointSizeNode;
