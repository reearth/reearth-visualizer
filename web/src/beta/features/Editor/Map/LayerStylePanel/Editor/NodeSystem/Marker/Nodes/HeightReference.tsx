import { Selector } from "@reearth/beta/lib/reearth-ui";
import { MarkerAppearance } from "@reearth/core";
import { FC, useCallback, useState } from "react";

import NodeSystem from "../..";
import { LayerStyleProps } from "../../../InterfaceTab";
import ConditionalTab from "../../ConditionalTab";
import ExpressionTab from "../../ExpressionTab";

import useHooks from "./hooks";

const options = [
  {
    value: "none",
    label: "none"
  },
  {
    value: "clamp",
    label: "clamp"
  },
  {
    value: "relative",
    label: "relative"
  }
];

const HeightReferenceNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const defaultValue = "none";
  const [value, setValue] = useState<MarkerAppearance["heightReference"]>(
    layerStyle?.value.marker?.heightReference ?? defaultValue
  );
  const [expression, setExpression] = useState<string>("");

  const { handleChange } = useHooks({
    apperanceTypeKey: "heightReference",
    layerStyle,
    value,
    expression,
    defaultValue,
    setValue,
    setExpression,
    setLayerStyle
  });

  const handleSelectorChange = useCallback(
    (newValue?: string | string[]) => {
      if (!newValue) return;
      handleChange("value", newValue as string);
    },
    [handleChange]
  );

  const renderContent: Record<string, JSX.Element> = {
    value: (
      <Selector
        value={value}
        options={options}
        onChange={handleSelectorChange}
      />
    ),
    expression: (
      <ExpressionTab
        value={expression}
        onChange={(val) => handleChange("expression", val as string)}
      />
    ),
    //TODO: will be implemented in next step
    condition: (
      <ConditionalTab>
        <Selector options={options} />
      </ConditionalTab>
    )
  };

  return (
    <NodeSystem title="HeightReference" optionsMenu={optionsMenu}>
      {(activeTab) => renderContent[activeTab] || null}
    </NodeSystem>
  );
};

export default HeightReferenceNode;
