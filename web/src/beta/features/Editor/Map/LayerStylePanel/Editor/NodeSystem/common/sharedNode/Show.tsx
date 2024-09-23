import { FC, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import SwitchInputNode, {
  DEFAULT_SWITCH_VALUE
} from "../fieldInputNode/SwitchInputNode";
import { AppearanceType, Condition } from "../type";

const ShowNode: FC<
  LayerStyleProps & {
    appearanceType: AppearanceType;
  }
> = ({ optionsMenu, layerStyle, appearanceType, setLayerStyle }) => {
  const [value, setValue] = useState<boolean | undefined>(
    layerStyle?.value[appearanceType]?.show ?? DEFAULT_SWITCH_VALUE
  );
  const [expression, setExpression] = useState<string>("");
  const [conditions, setConditions] = useState<Condition[]>([]);

  return (
    <SwitchInputNode
      appearanceType={appearanceType}
      appearanceTypeKey="show"
      title="Show"
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

export default ShowNode;
