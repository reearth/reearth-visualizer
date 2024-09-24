import { PolygonAppearance, PolylineAppearance } from "@reearth/core";
import { FC, useMemo, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import ColorInputNode, {
  DEFAULT_COLOR_VALUE
} from "../../common/fieldInputNode/ColorInputNode";
import { AppearanceType, Condition } from "../../common/type";

const StrokeColorNode: FC<
  LayerStyleProps & {
    appearanceType: AppearanceType;
  }
> = ({ optionsMenu, layerStyle, appearanceType, setLayerStyle }) => {
  const initialValue = useMemo(
    () => layerStyle?.value[appearanceType]?.strokeColor ?? DEFAULT_COLOR_VALUE,
    [layerStyle, appearanceType]
  );

  const initialExpression = useMemo(
    () => layerStyle?.value[appearanceType]?.strokeColor?.expression || "",
    [layerStyle, appearanceType]
  );
  const initialConditions = useMemo(
    () =>
      layerStyle?.value[appearanceType]?.strokeColor?.expression?.conditions ||
      [],
    [layerStyle, appearanceType]
  );

  const [value, setValue] = useState<
    PolylineAppearance["strokeColor"] | PolygonAppearance["strokeColor"]
  >(initialValue);
  const [expression, setExpression] = useState<string>(initialExpression);
  const [conditions, setConditions] = useState<Condition[]>(initialConditions);

  return (
    <ColorInputNode
      appearanceType={appearanceType}
      appearanceTypeKey="strokeColor"
      title="StrokeColor"
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

export default StrokeColorNode;
