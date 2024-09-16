import { NumberInput } from "@reearth/beta/lib/reearth-ui";
import { PolygonAppearance } from "@reearth/core";
import { FC, useState } from "react";

import NodeSystem from "../..";
import { LayerStyleProps } from "../../../InterfaceTab";
import ConditionalTab from "../../ConditionalTab";
import ExpressionTab from "../../ExpressionTab";

import useHooks from "./hooks";

const DEFAULT_VALUE = 0;

const StrokeWidthNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const [value, setValue] =
    useState<PolygonAppearance["strokeWidth"]>(DEFAULT_VALUE);
  const [expression, setExpression] = useState<string>("");

  const { handleChange } = useHooks({
    apperanceTypeKey: "strokeWidth",
    layerStyle,
    value,
    expression,
    defaultValue: DEFAULT_VALUE,
    setValue,
    setExpression,
    setLayerStyle
  });

  const renderContent: Record<string, JSX.Element> = {
    value: (
      <NumberInput
        value={value}
        onChange={(val) => handleChange("value", val)}
      />
    ),
    expression: (
      <ExpressionTab
        value={expression}
        onChange={(val) => handleChange("expression", val)}
      />
    ),
    //TODO: will be implemented in next step
    condition: (
      <ConditionalTab>
        <NumberInput />
      </ConditionalTab>
    )
  };

  return (
    <NodeSystem title="StrokeWidth" optionsMenu={optionsMenu}>
      {(activeTab) => renderContent[activeTab] || null}
    </NodeSystem>
  );
};

export default StrokeWidthNode;
