import { ColorInput } from "@reearth/beta/lib/reearth-ui";
import { PolygonAppearance } from "@reearth/core";
import { FC, useState } from "react";

import NodeSystem from "../..";
import { LayerStyleProps } from "../../../InterfaceTab";
import ConditionalTab from "../../ConditionalTab";
import ExpressionTab from "../../ExpressionTab";

import useHooks from "./hooks";

const DEFAULT_VALUE = undefined;

const StrokeColorNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const [value, setValue] =
    useState<PolygonAppearance["strokeColor"]>(DEFAULT_VALUE);
  const [expression, setExpression] = useState<string>("");

  const { handleChange } = useHooks({
    apperanceTypeKey: "strokeColor",
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
      <ColorInput
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
        <ColorInput />
      </ConditionalTab>
    )
  };

  return (
    <NodeSystem title="StrokeColor" optionsMenu={optionsMenu}>
      {(activeTab) => renderContent[activeTab] || null}
    </NodeSystem>
  );
};

export default StrokeColorNode;
