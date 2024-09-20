import { AppearanceTypes } from "@reearth/core";
import { FC, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import SelectorInputNode from "../SelectorInputNode";
import { Condition } from "../type";

const options = [
  { value: "none", label: "none" },
  { value: "clamp", label: "clamp" },
  { value: "relative", label: "relative" }
];

const HeightReferenceNode: FC<
  LayerStyleProps & {
    appearanceType: keyof Pick<AppearanceTypes, "marker" | "polygon" | "model">;
  }
> = ({ optionsMenu, layerStyle, appearanceType, setLayerStyle }) => {
  const [value, setValue] = useState(
    layerStyle?.value[appearanceType]?.heightReference ?? "none"
  );
  const [expression, setExpression] = useState<string>("");
  const [conditions, setConditions] = useState<Condition[]>([]);

  return (
    <SelectorInputNode
      appearanceType={appearanceType}
      appearanceTypeKey="heightReference"
      title="HeightReference"
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

export default HeightReferenceNode;
