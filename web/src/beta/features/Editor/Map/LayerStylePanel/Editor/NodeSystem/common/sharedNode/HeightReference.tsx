import { AppearanceTypes } from "@reearth/core";
import { FC, useMemo, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import SelectorInputNode from "../fieldInputNode/SelectorInputNode";
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
  const initialValue = useMemo(
    () => layerStyle?.value[appearanceType]?.heightReference ?? "none",
    [layerStyle, appearanceType]
  );

  const initialExpression = useMemo(
    () => layerStyle?.value[appearanceType]?.heightReference?.expression || "",
    [layerStyle, appearanceType]
  );
  const initialConditions = useMemo(
    () =>
      layerStyle?.value[appearanceType]?.heightReference?.expression
        ?.conditions || [],
    [layerStyle, appearanceType]
  );

  const [value, setValue] = useState(initialValue);

  const [expression, setExpression] = useState<string>(initialExpression);
  const [conditions, setConditions] = useState<Condition[]>(initialConditions);

  return (
    <SelectorInputNode
      appearanceType={appearanceType}
      appearanceTypeKey="heightReference"
      title="HeightReference"
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

export default HeightReferenceNode;
