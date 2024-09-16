import { TextInput } from "@reearth/beta/lib/reearth-ui";
import { ModelAppearance } from "@reearth/core";
import { FC, useState } from "react";

import NodeSystem from "../..";
import { LayerStyleProps } from "../../../InterfaceTab";
import ConditionalTab from "../../ConditionalTab";
import ExpressionTab from "../../ExpressionTab";

import useHooks from "./hooks";

const DEFAULT_VALUE = "";

const UrlNode: FC<LayerStyleProps> = ({
  optionsMenu,
  layerStyle,
  setLayerStyle
}) => {
  const [value, setValue] = useState<ModelAppearance["url"]>(DEFAULT_VALUE);
  const [expression, setExpression] = useState<string>("");

  const { handleChange } = useHooks({
    apperanceTypeKey: "url",
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
      <TextInput value={value} onChange={(val) => handleChange("value", val)} />
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
        <TextInput />
      </ConditionalTab>
    )
  };

  return (
    <NodeSystem title="Url" optionsMenu={optionsMenu}>
      {(activeTab) => renderContent[activeTab] || null}
    </NodeSystem>
  );
};

export default UrlNode;
