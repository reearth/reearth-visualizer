import { FC, useMemo, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import NumberInputNode, {
  DEFAULT_NUMBER_VALUE
} from "../fieldInputNode/NumberInputNode";
import { AppearanceType, Condition } from "../type";

const StrokeWidthNode: FC<
  LayerStyleProps & {
    appearanceType: AppearanceType;
  }
> = ({ optionsMenu, layerStyle, appearanceType, setLayerStyle }) => {
  const initialValue = useMemo(
    () =>
      layerStyle?.value[appearanceType]?.strokeWidth ?? DEFAULT_NUMBER_VALUE,
    [layerStyle, appearanceType]
  );

  const initialExpression = useMemo(
    () => layerStyle?.value[appearanceType]?.strokeWidth?.expression || "",
    [layerStyle, appearanceType]
  );
  const initialConditions = useMemo(
    () =>
      layerStyle?.value[appearanceType]?.strokeWidth?.expression?.conditions ||
      [],
    [appearanceType, layerStyle?.value]
  );

  const [value, setValue] = useState(initialValue);
  const [expression, setExpression] = useState<string>(initialExpression);
  const [conditions, setConditions] = useState<Condition[]>(initialConditions);

  return (
    <NumberInputNode
      appearanceType={appearanceType}
      appearanceTypeKey="strokeWidth"
      title="StrokeWidth"
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
export default StrokeWidthNode;
