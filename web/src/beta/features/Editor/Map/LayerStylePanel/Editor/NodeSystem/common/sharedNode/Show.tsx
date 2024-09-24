import { FC, useMemo, useState } from "react";

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
  const initialValue = useMemo(
    () => layerStyle?.value[appearanceType]?.show ?? DEFAULT_SWITCH_VALUE,
    [layerStyle, appearanceType]
  );

  const initialExpression = useMemo(
    () => layerStyle?.value[appearanceType]?.show?.expression || "",
    [layerStyle, appearanceType]
  );
  const initialConditions = useMemo(
    () => layerStyle?.value[appearanceType]?.show?.expression?.conditions || [],
    [layerStyle, appearanceType]
  );

  const [value, setValue] = useState<boolean | undefined>(initialValue);
  const [expression, setExpression] = useState<string>(initialExpression);
  const [conditions, setConditions] = useState<Condition[]>(initialConditions);

  return (
    <SwitchInputNode
      appearanceType={appearanceType}
      appearanceTypeKey="show"
      title="Show"
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

export default ShowNode;
