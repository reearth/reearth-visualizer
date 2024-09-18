import { FC, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import SwitchInputNode, { DEFAULT_SWITCH_VALUE } from "../SwitchInputNode";
import { AppearanceType } from "../type";

const ShowNode: FC<
  LayerStyleProps & {
    appearanceType: AppearanceType;
  }
> = ({ optionsMenu, layerStyle, appearanceType, setLayerStyle }) => {
  const [value, setValue] = useState<boolean | undefined>(DEFAULT_SWITCH_VALUE);
  const [expression, setExpression] = useState<string>("");

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
    />
  );
};

export default ShowNode;
