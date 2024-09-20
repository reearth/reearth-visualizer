import { MarkerAppearance } from "@reearth/core";
import { FC, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import SelectorInputNode from "../../common/SelectorInputNode";
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
  const [expression, setExpression] = useState<string>("");
  const [conditions, setConditions] = useState<Condition[]>([]);

  return (
    <SelectorInputNode
      appearanceType="marker"
      appearanceTypeKey="style"
      title="Style"
      optionsMenu={optionsMenu}
      options={options}
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

export default StylesNode;
