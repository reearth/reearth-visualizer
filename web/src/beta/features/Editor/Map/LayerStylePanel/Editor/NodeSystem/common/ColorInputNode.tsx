import { ColorInput } from "@reearth/beta/lib/reearth-ui";
import { SetStateAction } from "jotai";
import { Dispatch, FC } from "react";

import useHooks from "./hooks";
import ConditionalTab from "./tabs/ConditionalTab";
import ExpressionTab from "./tabs/ExpressionTab";
import { CommonIputProp } from "./type";

import NodeSystem from ".";

export const DEFAULT_COLOR_VALUE = undefined;

const ColorInputNode: FC<
  CommonIputProp & {
    value: string | undefined;
    setValue: Dispatch<SetStateAction<string | undefined>>;
  }
> = ({
  optionsMenu,
  title,
  layerStyle,
  appearanceType,
  appearanceTypeKey,
  value,
  setValue,
  expression,
  setExpression,
  setLayerStyle,
  conditions,
  setConditions
}) => {
  const { handleChange, handleConditionStatementChange } = useHooks({
    appearanceType,
    appearanceTypeKey,
    layerStyle,
    defaultValue: DEFAULT_COLOR_VALUE,
    value,
    setValue,
    expression,
    setExpression,
    conditions,
    setConditions,
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
        onBlur={(val) => handleChange("expression", val)}
      />
    ),
    condition: (
      <ConditionalTab conditions={conditions} setConditions={setConditions}>
        {(idx) => (
          <ColorInput
            value={(conditions[idx][1] as string) || ""}
            onChange={(val) => handleConditionStatementChange(idx, val)}
          />
        )}
      </ConditionalTab>
    )
  };

  return (
    <NodeSystem title={title} optionsMenu={optionsMenu}>
      {(activeTab) => renderContent[activeTab] || null}
    </NodeSystem>
  );
};

export default ColorInputNode;
