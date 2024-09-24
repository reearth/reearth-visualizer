import { ColorInput } from "@reearth/beta/lib/reearth-ui";
import { SetStateAction } from "jotai";
import { Dispatch, FC } from "react";

import ConditionalTab from "../ConditionalTab";
import ExpressionTab from "../ExpressionTab";
import { CommonInputProp, Tabs } from "../type";

import useHooks from "./hooks";

import NodeSystem from ".";

export const DEFAULT_COLOR_VALUE = undefined;

const ColorInputNode: FC<
  CommonInputProp & {
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
  const {
    activeTab,
    handleTabChange,
    handleConditionChange,
    handleConditionStatementChange
  } = useHooks({
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

  const renderContent: Record<Tabs, JSX.Element> = {
    value: (
      <ColorInput
        value={value}
        onChange={(val) => handleConditionChange("value", val)}
      />
    ),
    expression: (
      <ExpressionTab
        value={expression}
        onBlur={(val) => handleConditionChange("expression", val)}
      />
    ),
    condition: (
      <ConditionalTab conditions={conditions} setConditions={setConditions}>
        {(idx) => (
          <ColorInput
            value={(conditions[idx]?.[1] as string) || ""}
            onChange={(val) => handleConditionStatementChange(idx, val)}
          />
        )}
      </ConditionalTab>
    )
  };

  return (
    <NodeSystem
      title={title}
      optionsMenu={optionsMenu}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {(activeTab) => renderContent[activeTab] || null}
    </NodeSystem>
  );
};

export default ColorInputNode;
