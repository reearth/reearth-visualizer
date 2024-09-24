import { FC, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import SwitchInputNode, {
  DEFAULT_SWITCH_VALUE
} from "../../common/fieldInputNode/SwitchInputNode";
import { AppearanceType, Condition } from "../../common/type";

const ClampToGroundNode: FC<
  LayerStyleProps & {
    appearanceType: AppearanceType;
  }
> = ({ optionsMenu, layerStyle, setLayerStyle }) => {
  const [value, setValue] = useState<boolean | undefined>(
    layerStyle?.value?.polyline.clampToGround ?? DEFAULT_SWITCH_VALUE
  );
  const [expression, setExpression] = useState<string>("");
  const [conditions, setConditions] = useState<Condition[]>([]);

  return (
    <SwitchInputNode
      appearanceType="polyline"
      appearanceTypeKey="clampToGround"
      title="ClampToGround"
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

export default ClampToGroundNode;
