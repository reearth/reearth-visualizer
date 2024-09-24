import { MarkerAppearance } from "@reearth/core";
import { FC, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import SelectorInputNode from "../../common/fieldInputNode/SelectorInputNode";
import { Condition } from "../../common/type";

const options = [
  { value: "none", label: "none" },
  { value: "point", label: "point" },
  { value: "image", label: "image" }
];

const StylesNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const [value, setValue] = useState<MarkerAppearance["style"]>(
    layerStyle?.value.marker?.style ?? "none"
  );
  const [expression, setExpression] = useState<string>(
    layerStyle?.value?.marker?.style?.expression || ""
  );
  const [conditions, setConditions] = useState<Condition[]>(
    layerStyle?.value?.marker?.style?.expression?.conditions || []
  );

  return (
    <SelectorInputNode
      appearanceType="marker"
      appearanceTypeKey="style"
      title="Style"
      options={options}
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

export default StylesNode;
