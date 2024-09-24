import { Cesium3DTilesAppearance, MarkerAppearance } from "@reearth/core";
import { FC, useMemo, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import NumberInputNode, {
  DEFAULT_NUMBER_VALUE
} from "../../common/fieldInputNode/NumberInputNode";
import { AppearanceType, Condition } from "../../common/type";

const PointSizeNode: FC<
  LayerStyleProps & {
    appearanceType: AppearanceType;
  }
> = ({ optionsMenu, layerStyle, appearanceType, setLayerStyle }) => {
  const initialValue = useMemo(
    () => layerStyle?.value[appearanceType]?.pointSize ?? DEFAULT_NUMBER_VALUE,
    [layerStyle, appearanceType]
  );

  const initialExpression = useMemo(
    () => layerStyle?.value[appearanceType]?.pointSize?.expression || "",
    [layerStyle, appearanceType]
  );
  const initialConditions = useMemo(
    () =>
      layerStyle?.value[appearanceType]?.pointSize?.expression?.conditions ||
      [],
    [layerStyle, appearanceType]
  );

  const [value, setValue] = useState<
    MarkerAppearance["pointSize"] | Cesium3DTilesAppearance["pointSize"]
  >(initialValue);
  const [expression, setExpression] = useState<string>(initialExpression);

  const [conditions, setConditions] = useState<Condition[]>(initialConditions);

  return (
    <NumberInputNode
      appearanceType={appearanceType}
      appearanceTypeKey="pointSize"
      title="PointSize"
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

export default PointSizeNode;
