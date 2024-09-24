import { Switcher } from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";

import ConditionalTab from "../ConditionalTab";
import ExpressionTab from "../ExpressionTab";
import { CommonInputProp, Tabs } from "../type";

import useHooks from "./hooks";

import NodeSystem from ".";

export const DEFAULT_SWITCH_VALUE = false;

const SwitchInputNode: FC<
  CommonInputProp & {
    value: boolean | undefined;
    setValue: (value: boolean | undefined) => void;
  }
> = ({
  optionsMenu,
  title,
  layerStyle,
  appearanceType,
  appearanceTypeKey,
  setLayerStyle,
  value,
  setValue,
  expression,
  setExpression,
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
    defaultValue: DEFAULT_SWITCH_VALUE,
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
      <Switcher
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
          <Switcher
            value={(conditions[idx][1] as boolean) || DEFAULT_SWITCH_VALUE}
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

export default SwitchInputNode;
