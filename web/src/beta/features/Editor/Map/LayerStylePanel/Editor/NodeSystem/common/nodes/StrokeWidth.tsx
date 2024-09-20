import { FC, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import NumberInputNode from "../NumberInputNode";
import { AppearanceType, Condition } from "../type";

const StrokeWidthNode: FC<
  LayerStyleProps & {
    appearanceType: AppearanceType;
  }
> = ({ optionsMenu, layerStyle, appearanceType, setLayerStyle }) => {
  const [value, setValue] = useState(
    layerStyle?.value[appearanceType]?.strokeWidth ?? "none"
  );
  const [expression, setExpression] = useState<string>("");
  const [conditions, setConditions] = useState<Condition[]>([]);

  return (
    <NumberInputNode
      appearanceType={appearanceType}
      appearanceTypeKey="strokeWidth"
      title="StrokeWidth"
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
export default StrokeWidthNode;
