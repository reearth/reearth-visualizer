import { ColorInput } from "@reearth/beta/lib/reearth-ui";
import { Cesium3DTilesAppearance } from "@reearth/core";
import { FC, useState } from "react";

import { LayerStyleProps } from "../../../InterfaceTab";
import NodeSystem from "../../common";
import ConditionalTab from "../../tabs/ConditionalTab";
import ExpressionTab from "../../tabs/ExpressionTab";

import useHooks from "./hooks";

const DEFAULT_VALUE = undefined;

const ColorNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const [value, setValue] =
    useState<Cesium3DTilesAppearance["color"]>(DEFAULT_VALUE);
  const [expression, setExpression] = useState<string>("");

  const { handleChange } = useHooks({
    apperanceTypeKey: "color",
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
    <NodeSystem title="Color" optionsMenu={optionsMenu}>
      {(activeTab) => renderContent[activeTab] || null}
    </NodeSystem>
  );
};

export default ColorNode;
