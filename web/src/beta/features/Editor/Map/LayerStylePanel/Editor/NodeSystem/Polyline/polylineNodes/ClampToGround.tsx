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
    layerStyle?.value?.polyline?.clampToGround ?? DEFAULT_SWITCH_VALUE
  );
  const [expression, setExpression] = useState<string>(
    layerStyle?.value?.polyline?.clampToGround?.expression || ""
  );
  const [conditions, setConditions] = useState<Condition[]>(
    layerStyle?.value?.polyline?.clampToGround?.expression?.conditions || []
  );

  return (
    <SwitchInputNode
      appearanceType="polyline"
      appearanceTypeKey="clampToGround"
      title="ClampToGround"
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

export default ClampToGroundNode;
