import { PolygonAppearance, PolylineAppearance } from "@reearth/core";
import { FC, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import ColorInputNode, {
  DEFAULT_COLOR_VALUE
} from "../../common/ColorInputNode";
import { AppearanceType, Condition } from "../../common/type";

const StrokeColorNode: FC<
  LayerStyleProps & {
    appearanceType: AppearanceType;
  }
> = ({ optionsMenu, layerStyle, appearanceType, setLayerStyle }) => {
  const [value, setValue] = useState<
    PolylineAppearance["strokeColor"] | PolygonAppearance["strokeColor"]
  >(layerStyle?.value[appearanceType]?.strokeColor ?? DEFAULT_COLOR_VALUE);
  const [expression, setExpression] = useState<string>("");
  const [conditions, setConditions] = useState<Condition[]>([]);

  return (
    <ColorInputNode
      appearanceType={appearanceType}
      appearanceTypeKey="strokeColor"
      title="StrokeColor"
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

export default StrokeColorNode;
